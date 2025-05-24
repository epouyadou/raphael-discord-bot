import { z } from 'zod';

export const environmentSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_DEVELOPMENT_GUILD_IDs: z
    .string()
    .min(1)
    .transform((val) => {
      return val.split(',').map((id) => id.trim());
    }),
  POSTGRES_DB_USER: z.string().min(1),
  POSTGRES_DB_NAME: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().optional().default(5432),
  POSTGRES_SSL: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),
});

let env: z.infer<typeof environmentSchema> | undefined;

/**
 * Validates the environment variables by verifying that they are properly setup, parsing them and returning them
 * @returns The environment variables
 */
export function validateEnvVariables(): z.infer<typeof environmentSchema> {
  if (!env) {
    env = environmentSchema.parse(process.env);
  }
  return env;
}

/**
 * Get an environment variable, it ensures that the retrieved variable is properly configured
 * @param key The key of the environment variable
 * @returns The environment variable
 */
export function getEnv<K extends keyof z.infer<typeof environmentSchema>>(
  key: K,
): z.output<typeof environmentSchema>[K] {
  const env = validateEnvVariables();
  return env[key];
}

export function formatError(error: z.ZodError): string {
  return error.errors
    .map((e) => {
      const path = e.path.join('.');
      const message = e.message;
      const code = e.code;
      const details =
        code === 'invalid_type'
          ? `Expected ${e.expected}, received ${e.received}`
          : '';
      return `${path}: ${message}${details ? ` (${details})` : ''}`;
    })
    .join('\n');
}
