import { ConfigurableModuleBuilder } from '@nestjs/common';
import { AwsS3ModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AwsS3ModuleOptions>({
    moduleName: 'AwsS3',
  })
    .setClassMethodName('forRoot')
    .build();
