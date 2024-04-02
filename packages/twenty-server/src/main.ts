import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import * as Sentry from '@sentry/node';
import { graphqlUploadExpress } from 'graphql-upload';
import bytes from 'bytes';
import { useContainer } from 'class-validator';
import '@sentry/tracing';

import { AppModule } from './app.module';

import { generateFrontConfig } from './utils/generate-front-config';
import { settings } from './engine/constants/settings';
import { LoggerService } from './engine/integrations/logger/logger.service';
import { EnvironmentService } from './engine/integrations/environment/environment.service';

const bootstrap = async () => {
  const environmentService = new EnvironmentService(new ConfigService());
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: environmentService.get('LOGGER_IS_BUFFER_ENABLED'),
    rawBody: true,
    snapshot: environmentService.get('DEBUG_MODE'),
  });
  const logger = app.get(LoggerService);

  // TODO: Double check this as it's not working for now, it's going to be heplful for durable trees in twenty "orm"
  // // Apply context id strategy for durable trees
  // ContextIdFactory.apply(new AggregateByWorkspaceContextIdStrategy());

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

  // Create the env-config.js of the front at runtime
  generateFrontConfig();

  await app.listen(app.get(EnvironmentService).get('PORT'));
};

bootstrap();
