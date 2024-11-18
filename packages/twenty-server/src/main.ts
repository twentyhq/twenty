import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';

import session from 'express-session';
import bytes from 'bytes';
import { useContainer } from 'class-validator';
import { graphqlUploadExpress } from 'graphql-upload';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { ApplyCorsToExceptions } from 'src/utils/apply-cors-to-exceptions';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';
import ServerUrl from './engine/utils/serverUrl';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.DEBUG_MODE === 'true',
    ...(process.env.SERVER_URL &&
    process.env.SERVER_URL.startsWith('https') &&
    process.env.SSL_KEY_PATH &&
    process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });
  const logger = app.get(LoggerService);
  const environmentService = app.get(EnvironmentService);

  const serverUrl = new URL(
    `${environmentService.get('SERVER_URL')}:${environmentService.get('PORT')}`,
  );

  if (
    serverUrl.protocol === 'https:' &&
    (!environmentService.get('SSL_KEY_PATH') ||
      !environmentService.get('SSL_CERT_PATH'))
  )
    throw new Error(
      'SSL_KEY_PATH and SSL_CERT_PATH must be defined if https is used',
    );

  // set httpsOptions here

  // TODO: Double check this as it's not working for now, it's going to be heplful for durable trees in twenty "orm"
  // // Apply context id strategy for durable trees
  // ContextIdFactory.apply(new AggregateByWorkspaceContextIdStrategy());

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new ApplyCorsToExceptions());

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

  // Enable session - Today it's used only for SSO
  if (environmentService.get('AUTH_SSO_ENABLED')) {
    app.use(session(getSessionStorageOptions(environmentService)));
  }

  await app.listen(serverUrl.port, serverUrl.hostname);

  const url = new URL(await app.getUrl());

  // prevent ipv6 issue for redirectUri builder
  url.hostname = url.hostname === '[::1]' ? 'localhost' : url.hostname;

  ServerUrl.set(url.toString());

  logger.log(`Application is running on: ${url.toString()}`, 'Server Info');
};

bootstrap();
