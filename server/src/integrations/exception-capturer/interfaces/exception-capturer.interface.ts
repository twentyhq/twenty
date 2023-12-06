export enum ExceptionCapturerDriver {
  Sentry = 'sentry',
  Console = 'console',
}

export interface ExceptionCapturerSentryDriverFactoryOptions {
  type: ExceptionCapturerDriver.Sentry;
  options: {
    sentryDNS: string;
  };
}

export interface ExceptionCapturerDriverFactoryOptions {
  type: ExceptionCapturerDriver.Console;
}

export type ExceptionCapturerModuleOptions =
  | ExceptionCapturerSentryDriverFactoryOptions
  | ExceptionCapturerDriverFactoryOptions;
