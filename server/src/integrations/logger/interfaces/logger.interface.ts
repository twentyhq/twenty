export enum LoggerDriverType {
  Console = 'console',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriverType.Console;
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
