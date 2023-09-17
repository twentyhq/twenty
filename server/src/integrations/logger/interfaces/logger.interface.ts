import { LoggerDriver } from 'src/integrations/environment/interfaces/logger.interface';

export interface SentryDriverFactoryOptions {
  type: LoggerDriver.Sentry;
  options: {
    sentryDNS: string;
  };
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriver.Console;
  options: null;
}

export type LoggerModuleOptions =
  | SentryDriverFactoryOptions
  | ConsoleDriverFactoryOptions;
