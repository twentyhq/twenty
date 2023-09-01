import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as Sentry from '@sentry/node';
import * as bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload';
import bytes from 'bytes';

import { AppModule } from './app.module';

import { settings } from './constants/settings';
import { EnvironmentService } from './integrations/environment/environment.service';
import { SentryFilter } from './filters/sentry.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const config = app.get(EnvironmentService);

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

  // Sentry
  if (config.getSentryUrl()) {
    Sentry.init({
      dsn: config.getSentryUrl(),
    });
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new SentryFilter(httpAdapter));
  }

  await app.listen(3000);
}

bootstrap();
