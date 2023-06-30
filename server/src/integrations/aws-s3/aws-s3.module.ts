import { Global, Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { ConfigurableModuleClass } from './aws-s3.module-definition';

@Global()
@Module({
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module extends ConfigurableModuleClass {}
