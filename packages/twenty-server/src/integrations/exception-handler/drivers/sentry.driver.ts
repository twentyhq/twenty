import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import { ExceptionHandlerUser } from 'src/integrations/exception-handler/interfaces/exception-handler-user.interface';

import {
  ExceptionHandlerDriverInterface,
  ExceptionHandlerSentryDriverFactoryOptions,
} from 'src/integrations/exception-handler/interfaces';

export class ExceptionHandlerSentryDriver
  implements ExceptionHandlerDriverInterface
{
  constructor(options: ExceptionHandlerSentryDriverFactoryOptions['options']) {
    Sentry.init({
      dsn: options.dsn,
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

  captureException(exception: Error, user?: ExceptionHandlerUser) {
    Sentry.captureException(exception, (scope) => {
      if (user) {
        scope.setUser({
          id: user.id,
          ip_address: user.ipAddress,
          email: user.email,
          username: user.username,
        });
      }

      return scope;
    });
  }

  captureMessage(message: string, user?: ExceptionHandlerUser) {
    Sentry.captureMessage(message, (scope) => {
      if (user) {
        scope.setUser({
          id: user.id,
          ip_address: user.ipAddress,
          email: user.email,
          username: user.username,
        });
      }

      return scope;
    });
  }
}
