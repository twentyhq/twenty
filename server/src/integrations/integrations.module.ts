import { Module } from '@nestjs/common';

import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { ExceptionCapturerModule } from 'src/integrations/exception-capturer/exception-catpurer.module';
import { exceptionCapturerModuleFactory } from 'src/integrations/exception-capturer/exception-capturer.factory';

import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentService } from './environment/environment.service';
import { FileStorageModule } from './file-storage/file-storage.module';
import { FileStorageModuleOptions } from './file-storage/interfaces';
import { StorageType } from './environment/interfaces/storage.interface';
import { LoggerModule } from './logger/logger.module';
import { LoggerDriver, LoggerModuleOptions } from './logger/interfaces';
import { MessageQueueModule } from './message-queue/message-queue.module';
import { MessageQueueModuleOptions } from './message-queue/interfaces';
import { MessageQueueType } from './environment/interfaces/message-queue.interface';

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
      const endpoint = environmentService.getStorageS3Endpoint();
      const region = environmentService.getStorageS3Region();

      return {
        type: StorageType.S3,
        options: {
          bucketName: bucketName ?? '',
          endpoint: endpoint,
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
      };
    }
    default:
      throw new Error(`Invalid logger type (${type}), check your .env file`);
  }
};

/**
 * MessageQueue Module factory
 * @param environment
 * @returns MessageQueueModuleOptions
 */
const messageQueueModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<MessageQueueModuleOptions> => {
  const type = environmentService.getMessageQueueType();

  switch (type) {
    case MessageQueueType.PgBoss: {
      const connectionString = environmentService.getPGDatabaseUrl();

      return {
        type: MessageQueueType.PgBoss,
        options: {
          connectionString,
        },
      };
    }
    case MessageQueueType.BullMQ: {
      const host = environmentService.getRedisHost();
      const port = environmentService.getRedisPort();

      return {
        type: MessageQueueType.BullMQ,
        options: {
          connection: {
            host,
            port,
          },
        },
      };
    }
    default:
      throw new Error(
        `Invalid message queue type (${type}), check your .env file`,
      );
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
    MessageQueueModule.forRoot({
      useFactory: messageQueueModuleFactory,
      inject: [EnvironmentService],
    }),
    ExceptionCapturerModule.forRootAsync({
      useFactory: exceptionCapturerModuleFactory,
      inject: [EnvironmentService],
    }),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
