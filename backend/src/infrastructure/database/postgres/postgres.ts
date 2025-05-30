import { Pool, PoolClient } from 'pg';
import { getEnv } from 'src/core/utils/env';
import { v4 as uuidv4 } from 'uuid';

let pool: PostgresPool | undefined = undefined;
export function getPool() {
  if (pool) {
    return pool;
  }

  pool = new PostgresPool(
    new Pool({
      user: getEnv('POSTGRES_DB_USER'),
      database: getEnv('POSTGRES_DB_NAME'),
      password: getEnv('POSTGRES_PASSWORD'),
      host: getEnv('POSTGRES_HOST'),
      port: getEnv('POSTGRES_PORT'),
      ssl: getEnv('POSTGRES_SSL') ? { rejectUnauthorized: false } : false,
    }),
  );

  return pool;
}

export class PostgresClient {
  private client: PoolClient;
  private insideTransaction: boolean;

  constructor(client: PoolClient) {
    this.client = client;
    this.insideTransaction = false;
  }

  /**
   * Query the database
   * @param query The query to execute
   * @param params The parameters to pass to the query
   * @returns The result of the query
   */
  async query(query: string, params: any[]) {
    return this.client.query(query, params);
  }

  /**
   * Release the client
   */
  release() {
    return this.client.release();
  }

  /**
   * Transaction the database
   * @param fn The function to execute
   * @returns The result of the function
   */
  async transaction<T>(fn: (client: PostgresClient) => Promise<T>) {
    if (this.insideTransaction) {
      const uuid = uuidv4();
      await this.client.query(`SAVEPOINT '${uuid}'`);
      try {
        const result = await fn(this);
        await this.client.query(`RELEASE SAVEPOINT '${uuid}'`);
        return result;
      } catch (error) {
        await this.client.query(`ROLLBACK TO SAVEPOINT '${uuid}'`);
        throw error;
      }
    } else {
      this.insideTransaction = true;
      await this.client.query('BEGIN');
      try {
        const result = await fn(this);
        await this.client.query('COMMIT');
        return result;
      } catch (error) {
        await this.client.query('ROLLBACK');
        throw error;
      } finally {
        this.insideTransaction = false;
      }
    }
  }
}

export class PostgresPool {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Query the database
   * @param query The query to execute
   * @param params The parameters to pass to the query
   * @returns The result of the query
   */
  async query(query: string, params: any[]) {
    return this.pool.query(query, params);
  }

  /**
   * End the pool
   */
  async end() {
    return this.pool.end();
  }

  /**
   * Get a client from the pool
   * @returns A client from the pool
   */
  async getClient(): Promise<PostgresClient> {
    const client = await this.pool.connect();
    return new PostgresClient(client);
  }

  /**
   * Transaction the database
   * @param query The query to execute
   * @param params The parameters to pass to the query
   * @returns The result of the query
   */
  async transaction<T>(fn: (client: PostgresClient) => Promise<T>) {
    const client = await this.getClient();
    return client.transaction(fn);
  }
}
