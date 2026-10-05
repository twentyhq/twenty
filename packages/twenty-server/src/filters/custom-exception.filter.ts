import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { type Response } from 'express';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { sendHttpExceptionResponse } from 'src/engine/core-modules/exception-handler/utils/send-http-exception-response.util';
import { convertCustomExceptionToGraphQLError } from 'src/engine/core-modules/graphql/utils/convert-custom-exception-to-graphql-error.util';
import { CustomException } from 'src/utils/custom-exception';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: CustomException, host: ArgumentsHost) {
    // Returning instead of throwing keeps Nest from logging it
    if (host.getType<GqlContextType>() === 'graphql') {
      return convertCustomExceptionToGraphQLError(exception);
    }

    return sendHttpExceptionResponse({
      exception,
      response: host.switchToHttp().getResponse<Response>(),
      exceptionHandlerService: this.exceptionHandlerService,
    });
  }
}
