import { ConfigurableModuleBuilder } from '@nestjs/common';
import { LocalStorageModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<LocalStorageModuleOptions>({
    moduleName: 'LocalStorage',
  })
    .setClassMethodName('forRoot')
    .build();
