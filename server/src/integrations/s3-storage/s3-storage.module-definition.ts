import { ConfigurableModuleBuilder } from '@nestjs/common';
import { S3StorageModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<S3StorageModuleOptions>({
    moduleName: 'S3Storage',
  })
    .setClassMethodName('forRoot')
    .build();
