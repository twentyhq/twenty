import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { EventMetadataException } from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { getEventMetadataExceptionHttpStatus } from 'src/engine/metadata-modules/event-metadata/utils/get-event-metadata-exception-http-status.util';

@Injectable()
@Catch(EventMetadataException)
export class EventMetadataRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: EventMetadataException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      getEventMetadataExceptionHttpStatus(exception.code),
    );
  }
}
