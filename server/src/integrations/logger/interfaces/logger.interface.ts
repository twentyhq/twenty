export enum LoggerDriver {
  Console = 'console',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriver.Console;
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
