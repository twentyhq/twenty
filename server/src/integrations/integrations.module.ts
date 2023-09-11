import { Module } from '@nestjs/common';

import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentService } from './environment/environment.service';
import { FileStorageModule } from './file-storage/file-storage.module';
import { FileStorageModuleOptions } from './file-storage/interfaces';
import { StorageType } from './environment/interfaces/storage.interface';
import { LoggerModule } from './logger/logger.module';
import { LoggerModuleOptions } from './logger/interfaces';
import { LoggerDriver } from './environment/interfaces/logger.interface';

/**
 * FileStorage Module factory
 * @param environment
 * @returns FileStorageModuleOptions
 */
const fileStorageModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<FileStorageModuleOptions> => {
  const type = environmentService.getStorageType();

  switch (type) {
    case StorageType.Local: {
      const storagePath = environmentService.getStorageLocalPath();

      return {
        type: StorageType.Local,
        options: {
          storagePath: process.cwd() + '/' + storagePath,
        },
      };
    }
    case StorageType.S3: {
      const bucketName = environmentService.getStorageS3Name();
      const region = environmentService.getStorageS3Region();

      return {
        type: StorageType.S3,
        options: {
          bucketName: bucketName ?? '',
          credentials: fromNodeProviderChain({
            clientConfig: { region },
          }),
          forcePathStyle: true,
          region: region ?? '',
        },
      };
    }
    default:
      throw new Error(`Invalid storage type (${type}), check your .env file`);
  }
};

/**
 * Logger Module factory
 * @param environment
 * @returns LoggerModuleOptions
 */
const loggerModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<LoggerModuleOptions> => {
  const type = environmentService.getLoggerDriver();
  switch (type) {
    case LoggerDriver.Console: {
      return {
        type: LoggerDriver.Console,
        options: null,
      };
    }
    case LoggerDriver.Sentry: {
      return {
        type: LoggerDriver.Sentry,
        options: {
          sentryDNS: environmentService.getSentryDSN() ?? '',
        },
      };
    }
    default:
      throw new Error(`Invalid logger type (${type}), check your .env file`);
  }
};

@Module({
  imports: [
    EnvironmentModule.forRoot({}),
    FileStorageModule.forRootAsync({
      useFactory: fileStorageModuleFactory,
      inject: [EnvironmentService],
    }),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [EnvironmentService],
    }),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
