import { NestFactory } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';

import bytes from 'bytes';
import { useContainer } from 'class-validator';
import { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { setPgDateTypeParser } from 'src/database/pg/set-pg-date-type-parser';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';

const API_PATH_PREFIXES = ['/graphql', '/metadata', '/rest', '/healthz', '/mcp'];

const isApiPath = (path: string): boolean =>
  API_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

// Trigger
const bootstrap = async () => {
  setPgDateTypeParser();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
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

  app.use(session(getSessionStorageOptions(twentyConfigService)));

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new UnhandledExceptionFilter());

  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });

  // Graphql file upload
  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  app.use(
    '/metadata',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  // In development, serve frontend through :3000 by proxying non-API traffic to Vite.
  if (process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT) {
    const frontDevServerUrl =
      process.env.FRONTEND_DEV_SERVER_URL ?? 'http://127.0.0.1:3001';
    const frontDevProxy = createProxyMiddleware({
      target: frontDevServerUrl,
      changeOrigin: true,
      ws: true,
      xfwd: true,
      secure: false,
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }

      if (isApiPath(req.path)) {
        return next();
      }

      return frontDevProxy(req, res, next);
    });

    app.getHttpServer().on('upgrade', (request, socket, head) => {
      const requestPath = request.url ?? '/';

      if (isApiPath(requestPath)) {
        return;
      }

      frontDevProxy.upgrade?.(
        request,
        socket as unknown as import('net').Socket,
        head,
      );
    });
  }

  // Inject the server url in the frontend page
  generateFrontConfig();

  await app.listen(twentyConfigService.get('NODE_PORT'));
};

bootstrap();
