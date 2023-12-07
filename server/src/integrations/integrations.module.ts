import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ExceptionCapturerModule } from 'src/integrations/exception-capturer/exception-catpurer.module';
import { exceptionCapturerModuleFactory } from 'src/integrations/exception-capturer/exception-capturer.module-factory';
import { fileStorageModuleFactory } from 'src/integrations/file-storage/file-storage.module-factory';
import { loggerModuleFactory } from 'src/integrations/logger/logger.module-factory';
import { messageQueueModuleFactory } from 'src/integrations/message-queue/message-queue.module-factory';

import { EnvironmentModule } from './environment/environment.module';
import { EnvironmentService } from './environment/environment.service';
import { FileStorageModule } from './file-storage/file-storage.module';
import { LoggerModule } from './logger/logger.module';
import { MessageQueueModule } from './message-queue/message-queue.module';

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
      inject: [EnvironmentService, HttpAdapterHost],
    }),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
