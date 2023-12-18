import { Router } from 'express';

export enum ExceptionHandlerDriver {
  Sentry = 'sentry',
  Console = 'console',
}

export interface ExceptionHandlerSentryDriverFactoryOptions {
  type: ExceptionHandlerDriver.Sentry;
  options: {
    dns: string;
    serverInstance?: Router;
    debug?: boolean;
  };
}

export interface ExceptionHandlerDriverFactoryOptions {
  type: ExceptionHandlerDriver.Console;
}

export type ExceptionHandlerModuleOptions =
  | ExceptionHandlerSentryDriverFactoryOptions
  | ExceptionHandlerDriverFactoryOptions;
