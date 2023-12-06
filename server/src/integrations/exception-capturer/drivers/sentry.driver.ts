import * as Sentry from '@sentry/node';

import { ExceptionCapturerDriverInterface } from 'src/integrations/exception-capturer/interfaces';

export interface ExceptionCapturerSentryDriverOptions {
  sentryDNS: string;
}

export class ExceptionCapturerSentryDriver
  implements ExceptionCapturerDriverInterface
{
  constructor(options: ExceptionCapturerSentryDriverOptions) {
    Sentry.init({
      dsn: options.sentryDNS,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  }

  captureException(exception: Error) {
    Sentry.captureException(exception);
  }
}
