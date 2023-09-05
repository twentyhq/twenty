import { LoggerService } from '@nestjs/common';

import * as Sentry from '@sentry/node';

export interface SentryDriverOptions {
  sentryDNS: string;
}

export class SentryDriver implements LoggerService {
  constructor(options: SentryDriverOptions) {
    Sentry.init({
      dsn: options.sentryDNS,
    });
  }

  log(message: any) {
    Sentry.captureMessage(message, 'log');
  }

  error(message: any) {
    Sentry.captureMessage(message, 'error');
  }

  warn(message: any) {
    Sentry.captureMessage(message, 'warning');
  }

  debug?(message: any) {
    Sentry.captureMessage(message, 'debug');
  }

  verbose?(message: any) {
    Sentry.captureMessage(message, 'info');
  }
}
