import {
  ConfigurableModuleBuilder,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';

import { ExceptionCapturerModuleOptions } from './interfaces';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ExceptionCapturerModuleOptions>({
  moduleName: 'ExceptionCapturerModule',
})
  .setClassMethodName('forRoot')
  .build();

export type ExceptionCapturerModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => ExceptionCapturerModuleOptions | Promise<ExceptionCapturerModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
