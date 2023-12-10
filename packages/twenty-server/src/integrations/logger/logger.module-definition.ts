import {
  ConfigurableModuleBuilder,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';

import { LoggerModuleOptions } from './interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<LoggerModuleOptions>({
  moduleName: 'LoggerService',
})
  .setClassMethodName('forRoot')
  .build();

export type LoggerModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => LoggerModuleOptions | Promise<LoggerModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
