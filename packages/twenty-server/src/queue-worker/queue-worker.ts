import { NestFactory } from '@nestjs/core';

import { shouldFilterException } from 'src/engine/utils/global-exception-handler.util';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { LoggerService } from 'src/engine/integrations/logger/logger.service';
import { QueueWorkerModule } from 'src/queue-worker/queue-worker.module';

async function bootstrap() {
  let exceptionHandlerService: ExceptionHandlerService | undefined;
  let loggerService: LoggerService | undefined;

  try {
    const app = await NestFactory.createApplicationContext(QueueWorkerModule, {
      bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    });

    loggerService = app.get(LoggerService);
    exceptionHandlerService = app.get(ExceptionHandlerService);

    // Inject our logger
    app.useLogger(loggerService!);
  } catch (err) {
    loggerService?.error(err?.message, err?.name);

    if (!shouldFilterException(err)) {
      exceptionHandlerService?.captureExceptions([err]);
    }

    throw err;
  }
}
bootstrap();
