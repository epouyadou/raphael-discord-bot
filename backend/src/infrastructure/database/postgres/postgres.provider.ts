import { getPool, PostgresPool } from './postgres';

export const postgresProvider = {
  provide: PostgresPool,
  useFactory: () => {
    return getPool();
  },
};
