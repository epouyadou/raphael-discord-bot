import { getEnv } from '@domain/core/utils/env';
import { createClientPool, RedisClientPoolType } from 'redis';

export const REDIS_CLIENT_POOL = Symbol('RedisClientPool');
export type RedisPool = RedisClientPoolType;

let pool: RedisPool | undefined;

export const redisProvider = {
  provide: REDIS_CLIENT_POOL,
  useFactory: async () => {
    if (pool) {
      return pool;
    }

    const redisUrl = getEnv('REDIS_URL');
    const isSSL = redisUrl.startsWith('rediss:');
    const url = new URL(redisUrl);
    const password = getEnv('REDIS_PASSWORD');

    pool = createClientPool({
      url: redisUrl,
      password: password || undefined,
      socket: isSSL
        ? {
            tls: true,
            host: url.hostname,
            rejectUnauthorized: false,
          }
        : undefined,
    });

    await pool.connect();

    return pool;
  },
};
