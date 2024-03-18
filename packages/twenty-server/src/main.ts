import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as Sentry from '@sentry/node';
import { graphqlUploadExpress } from 'graphql-upload';
import bytes from 'bytes';
import { useContainer } from 'class-validator';
import '@sentry/tracing';

import { AppModule } from './app.module';

import { settings } from './engine/constants/settings';
import { LoggerService } from './engine/integrations/logger/logger.service';
import { EnvironmentService } from './engine/integrations/environment/environment.service';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
  });
  const logger = app.get(LoggerService);

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  if (Sentry.isInitialized()) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }

  // Apply validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });

  // Graphql file upload
  app.use(
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  await app.listen(app.get(EnvironmentService).get('PORT'));
};

bootstrap();
