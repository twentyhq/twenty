import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type CustomException } from 'src/utils/custom-exception';

@Injectable()
@Catch(FlatEntityMapsException)
export class FlatEntityMapsRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: FlatEntityMapsException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND:
      case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          404,
        );
      case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          409,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception as CustomException,
          response,
          500,
        );
    }
  }
}
