import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { graphqlUploadExpress } from 'graphql-upload';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Apply validation pipes globally
  app.useGlobalPipes(new ValidationPipe());

  // Graphql file upload
  app.use(graphqlUploadExpress());

  await app.listen(3000);
}

bootstrap();
