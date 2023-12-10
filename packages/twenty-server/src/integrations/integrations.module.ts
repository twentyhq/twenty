import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ExceptionHandlerModule } from 'src/integrations/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/integrations/exception-handler/exception-handler.module-factory';
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
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [EnvironmentService, HttpAdapterHost],
    }),
  ],
  exports: [],
  providers: [],
})
export class IntegrationsModule {}
