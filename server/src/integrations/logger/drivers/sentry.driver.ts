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

  private logLevels = ['log', 'error', 'warning', 'debug', 'info'];

  setLogLevels(levels: string[]) {
    this.logLevels = levels;
  }

  log(message: any) {
    if (this.logLevels.includes('log')) {
      Sentry.captureMessage(message, { level: 'log' });
    }
  }

  error(message: any) {
    if (this.logLevels.includes('error')) {
      Sentry.captureMessage(message, { level: 'error' });
    }
  }

  warn(message: any) {
    if (this.logLevels.includes('warn')) {
      Sentry.captureMessage(message, { level: 'warning' });
    }
  }

  debug?(message: any) {
    if (this.logLevels.includes('debug')) {
      Sentry.captureMessage(message, { level: 'debug' });
    }
  }

  verbose?(message: any) {
    if (this.logLevels.includes('verbose')) {
      Sentry.captureMessage(message, { level: 'info' });
    }
  }
}
