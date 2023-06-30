import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { AwsS3ModuleOptions } from './aws-s3/interfaces';
import { LocalStorageModule } from './local-storage/local-storage.module';
import { LocalStorageModuleOptions } from './local-storage/interfaces';

/**
 * AWS S3 Module factory
 * @param config
 * @returns S3ModuleOptions
 */
const awsS3ModuleFactory = async (
  config: ConfigService,
): Promise<AwsS3ModuleOptions> => {
  const fileSystem = config.get<string>('FILESYSTEM_DISK');
  const folderName = config.get<string>('UPLOAD_FOLDER_NAME')!;
  // TODO: add region to environment variables
  const region = 'eu-west-1';

  if (fileSystem === 'local') {
    return { bucketName: folderName };
  }

  return {
    bucketName: folderName,
    credentials: fromNodeProviderChain({
      clientConfig: { region },
    }),
    forcePathStyle: true,
    region,
  };
};

/**
 * LocalStorage Module factory
 * @param environment
 * @returns S3ModuleOptions
 */
const localStorageModuleFactory = async (
  config: ConfigService,
): Promise<LocalStorageModuleOptions> => {
  const folderName = config.get<string>('UPLOAD_FOLDER_NAME');

  return {
    folder: process.cwd() + '/' + folderName,
  };
};

@Module({
  imports: [
    AwsS3Module.forRootAsync({
      useFactory: awsS3ModuleFactory,
      inject: [ConfigService],
    }),
    LocalStorageModule.forRootAsync({
      useFactory: localStorageModuleFactory,
      inject: [ConfigService],
    }),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
