import { Router } from 'express';

export enum ExceptionCapturerDriver {
  Sentry = 'sentry',
  Console = 'console',
}

export interface ExceptionCapturerSentryDriverFactoryOptions {
  type: ExceptionCapturerDriver.Sentry;
  options: {
    dns: string;
    serverInstance: Router;
    debug?: boolean;
  };
}

export interface ExceptionCapturerDriverFactoryOptions {
  type: ExceptionCapturerDriver.Console;
}

export type ExceptionCapturerModuleOptions =
  | ExceptionCapturerSentryDriverFactoryOptions
  | ExceptionCapturerDriverFactoryOptions;
