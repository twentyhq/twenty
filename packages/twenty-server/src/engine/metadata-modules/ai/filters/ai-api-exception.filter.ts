import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import type { Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Catch(AiException)
export class AiRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
  ) {}

  catch(exception: AiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case AiExceptionCode.AGENT_NOT_FOUND:
      case AiExceptionCode.THREAD_NOT_FOUND:
      case AiExceptionCode.MESSAGE_NOT_FOUND:
      case AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      case AiExceptionCode.ROLE_NOT_FOUND:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          404,
        );
      case AiExceptionCode.API_KEY_NOT_CONFIGURED:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          503, // Service Unavailable - the AI service is not configured
        );
      case AiExceptionCode.AGENT_EXECUTION_FAILED:
      case AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
      case AiExceptionCode.INVALID_AGENT_INPUT:
      case AiExceptionCode.AGENT_ALREADY_EXISTS:
      case AiExceptionCode.AGENT_IS_STANDARD:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          400,
        );
      default:
        return this.httpExceptionHandlerService.handleError(
          exception,
          response,
          500,
        );
    }
  }
}
