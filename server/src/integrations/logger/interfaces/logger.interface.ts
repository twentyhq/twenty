import { LoggerType } from 'src/integrations/environment/interfaces/logger.interface';

export interface SentryDriverFactoryOptions {
  type: LoggerType.Sentry;
  options: {
    sentryDNS: string;
  };
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerType.Console;
  options: null;
}

export type LoggerModuleOptions =
  | SentryDriverFactoryOptions
  | ConsoleDriverFactoryOptions;
