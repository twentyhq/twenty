import { LogLevel } from '@nestjs/common';

export enum LoggerDriverType {
  Console = 'console',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriverType.Console;
  logLevels?: LogLevel[];
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
