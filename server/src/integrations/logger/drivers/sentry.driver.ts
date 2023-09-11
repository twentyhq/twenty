import { LoggerService } from '@nestjs/common';

import * as Sentry from '@sentry/node';

export interface SentryDriverOptions {
  sentryDNS: string;
}

export class SentryDriver implements LoggerService {
  constructor(options: SentryDriverOptions) {
    Sentry.init({
      dsn: options.sentryDNS,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }

  log(message: any, category: string) {
    Sentry.addBreadcrumb({
      message,
      level: 'log',
      data: {
        category,
      },
    });
  }

  error(message: any, category: string) {
    Sentry.addBreadcrumb({
      message,
      level: 'error',
      data: {
        category,
      },
    });
  }

  warn(message: any, category: string) {
    Sentry.addBreadcrumb({
      message,
      level: 'error',
      data: {
        category,
      },
    });
  }

  debug?(message: any, category: string) {
    Sentry.addBreadcrumb({
      message,
      level: 'debug',
      data: {
        category,
      },
    });
  }

  verbose?(message: any, category: string) {
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: {
        category,
      },
    });
  }
}
