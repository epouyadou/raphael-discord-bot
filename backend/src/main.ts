import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { formatError, validateEnvVariables } from './core/utils/env';

async function bootstrap() {
  try {
    validateEnvVariables();
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    console.error(formatError(error));
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

void bootstrap();
