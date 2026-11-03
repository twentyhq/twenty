import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';
import { type Server } from 'http';
import { inspect } from 'util';

import bytes from 'bytes';
import { useContainer } from 'class-validator';
import session from 'express-session';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { ApiPath } from 'twenty-shared/types';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { setPgDateTypeParser } from 'src/database/pg/set-pg-date-type-parser';
import { ApplicationRepeatedEventRecorderService } from 'src/engine/core-modules/event-logs/emit/application-repeated-event-recorder.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { applyCredentialedCors } from 'src/engine/core-modules/user-session/utils/apply-credentialed-cors.util';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { enableValidationMetadataCache } from './utils/enable-validation-metadata-cache.util';
import { createHttpServerShutdown } from './utils/create-http-server-shutdown.util';

const APPLICATION_SHUTDOWN_TIMEOUT_MS = 90_000;

const bootstrap = async () => {
  enableValidationMetadataCache();
  setPgDateTypeParser();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
    ...(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });
  const logger = app.get(LoggerService);
  const twentyConfigService = app.get(TwentyConfigService);
  const exceptionHandlerService = app.get(ExceptionHandlerService);

  process.on('unhandledRejection', (reason) => {
    const error =
      reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : inspect(reason));

    if (shouldCaptureException(error)) {
      exceptionHandlerService.captureExceptions([error]);
    }
  });

  const trustProxyRaw = twentyConfigService.get('TRUST_PROXY');
  const trustProxy = /^\d+$/.test(trustProxyRaw)
    ? Number(trustProxyRaw)
    : (configTransformers.boolean(trustProxyRaw) ?? trustProxyRaw);

  app.set('trust proxy', trustProxy);

  applyCredentialedCors(app, twentyConfigService);

  app.use(session(getSessionStorageOptions(twentyConfigService)));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useLogger(logger);

  app.useBodyParser('json', { limit: settings.maxRequestBodySize });
  app.useBodyParser('urlencoded', {
    limit: settings.maxRequestBodySize,
    extended: true,
  });
  app.useBodyParser('text', { type: 'text/plain', limit: '1024kb' });

  app.use(
    `/${ApiPath.GraphQL}`,
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.maxRequestBodySize)!,
      maxFileSize: bytes(settings.maxRequestBodySize)!,
      maxFiles: 10,
    }),
  );

  app.use(
    `/${ApiPath.Metadata}`,
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.maxRequestBodySize)!,
      maxFileSize: bytes(settings.maxRequestBodySize)!,
      maxFiles: 10,
    }),
  );

  const keepAliveTimeout = twentyConfigService.get(
    'SERVER_KEEP_ALIVE_TIMEOUT_MS',
  );
  const httpServer: Server = app.getHttpServer();
  const shutdownHttpServer = createHttpServerShutdown(httpServer);

  httpServer.keepAliveTimeout = keepAliveTimeout;
  httpServer.headersTimeout = keepAliveTimeout + 1000;

  const usageRecorder = app.get(UsageRecorderService);
  const applicationRepeatedEventRecorder = app.get(
    ApplicationRepeatedEventRecorderService,
  );

  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    const shutdownTimeout = setTimeout(() => {
      logger.error('Application shutdown exceeded its deadline', 'Bootstrap');
      process.exit(1);
    }, APPLICATION_SHUTDOWN_TIMEOUT_MS);

    shutdownTimeout.unref();

    try {
      await shutdownHttpServer();

      // Requests can still record usage until HTTP draining has finished.
      await Promise.allSettled([
        usageRecorder.flushAndStop(),
        applicationRepeatedEventRecorder.flushAndStop(),
      ]);

      await app.close();
      clearTimeout(shutdownTimeout);
      process.exit(0);
    } catch (error) {
      logger.error('Application shutdown failed', 'Bootstrap', error);
      process.exit(1);
    }
  };

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      void shutdown();
    });
  }

  await app.listen(twentyConfigService.get('NODE_PORT'));
};

void bootstrap();
