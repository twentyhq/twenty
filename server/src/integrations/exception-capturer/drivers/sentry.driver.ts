import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import {
  ExceptionCapturerDriverInterface,
  ExceptionCapturerSentryDriverFactoryOptions,
} from 'src/integrations/exception-capturer/interfaces';

export class ExceptionCapturerSentryDriver
  implements ExceptionCapturerDriverInterface
{
  constructor(options: ExceptionCapturerSentryDriverFactoryOptions['options']) {
    Sentry.init({
      dsn: options.dns,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app: options.serverInstance }),
        new Sentry.Integrations.GraphQL(),
        new Sentry.Integrations.Postgres({
          usePgNative: true,
        }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: options.debug ? 'development' : 'production',
      debug: options.debug,
    });
  }

  captureException(exception: Error) {
    Sentry.captureException(exception);
  }

  captureMessage(message: string) {
    Sentry.captureMessage(message);
  }
}
