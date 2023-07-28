import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload';
import bytes from 'bytes';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

import { settings } from './constants/settings';

dotenv.config();

async function bootstrap() {
  const isCorsEnabled = process.env.IS_CORS_ENABLED !== 'false';
  const app = await NestFactory.create(AppModule, {
    cors: isCorsEnabled,
  });

  // Apply validation pipes globally
  app.useGlobalPipes(new ValidationPipe());

  app.use(bodyParser.json({ limit: settings.storage.maxFileSize }));
  app.use(
    bodyParser.urlencoded({
      limit: settings.storage.maxFileSize,
      extended: true,
    }),
  );

  // Graphql file upload
  app.use(
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  await app.listen(3000);
}

bootstrap();
