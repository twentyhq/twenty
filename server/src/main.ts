import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload';
import bytes from 'bytes';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

import { settings } from './constants/settings';
import { LoggerService } from './integrations/logger/logger.service';
import { EnvironmentService } from './integrations/environment/environment.service';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: process.env.DEBUG_MODE
      ? ['error', 'warn', 'log', 'verbose', 'debug']
      : ['error', 'warn', 'log'],
  });

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Apply validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

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
  const loggerService = app.get(LoggerService);

  app.useLogger(loggerService);
  app.useLogger(app.get(EnvironmentService).getLogLevels());

  await app.listen(app.get(EnvironmentService).getPort());
};

bootstrap();
