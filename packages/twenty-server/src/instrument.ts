import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { WorkspaceCacheKeys } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

if (process.env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry) {
  Sentry.init({
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // TODO: Redis integration doesn't seem to work - investigate why
      Sentry.redisIntegration({
        cachePrefixes: Object.values(WorkspaceCacheKeys).map(
          (key) => `engine:${key}:`,
        ),
      }),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.postgresIntegration(),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.3,
    debug: process.env.DEBUG_MODE === 'true',
  });
}
