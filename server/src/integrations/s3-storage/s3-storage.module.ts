import { Global, Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { ConfigurableModuleClass } from './s3-storage.module-definition';

@Global()
@Module({
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class S3StorageModule extends ConfigurableModuleClass {}
