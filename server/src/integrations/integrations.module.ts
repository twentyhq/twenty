import { Module } from '@nestjs/common';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { S3StorageModule } from './s3-storage/s3-storage.module';
import { S3StorageModuleOptions } from './s3-storage/interfaces';
import { LocalStorageModule } from './local-storage/local-storage.module';
import { LocalStorageModuleOptions } from './local-storage/interfaces';
import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentService } from './environment/environment.service';

/**
 * S3 Storage Module factory
 * @param config
 * @returns S3ModuleOptions
 */
const S3StorageModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<S3StorageModuleOptions> => {
  const bucketName = environmentService.getStorageS3Name();
  const region = environmentService.getStorageS3Region();

  return {
    bucketName: bucketName ?? '',
    credentials: fromNodeProviderChain({
      clientConfig: { region },
    }),
    forcePathStyle: true,
    region: region ?? '',
  };
};

/**
 * LocalStorage Module factory
 * @param environment
 * @returns LocalStorageModuleOptions
 */
const localStorageModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<LocalStorageModuleOptions> => {
  const storagePath = environmentService.getStorageLocalPath();

  return {
    storagePath: process.cwd() + '/' + storagePath,
  };
};

@Module({
  imports: [
    S3StorageModule.forRootAsync({
      useFactory: S3StorageModuleFactory,
      inject: [EnvironmentService],
    }),
    LocalStorageModule.forRootAsync({
      useFactory: localStorageModuleFactory,
      inject: [EnvironmentService],
    }),
    EnvironmentModule.forRoot({}),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
