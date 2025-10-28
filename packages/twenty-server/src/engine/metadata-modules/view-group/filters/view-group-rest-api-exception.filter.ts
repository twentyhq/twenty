import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import {
  ViewGroupException,
  ViewGroupExceptionCode
} from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';
import { type CustomException, UnknownException } from 'src/utils/custom-exception';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

@Injectable()
@Catch(ViewGroupException, WorkspaceMigrationBuilderExceptionV2)
export class ViewGroupRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(exception: ViewGroupException | WorkspaceMigrationBuilderExceptionV2, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof WorkspaceMigrationBuilderExceptionV2) {
      const i18n = this.i18nService.getI18nInstance(SOURCE_LOCALE);
      const { errors, summary } =
        fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError(
          exception,
          i18n,
        );

      return response.status(400).json({
        statusCode: 400,
        error: 'METADATA_VALIDATION_ERROR',
        message: exception.message || 'Validation failed',
        errors,
        summary,
      });
    }

    if (exception instanceof ViewGroupException) {
      switch (exception.code) {
        case ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            404,
          );
        case ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            400,
          );
        default:
          // TODO: change to 500 when we have input validation
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            400,
          );
      }
    }

    const unknownException = new UnknownException(
      'Internal server error',
      'INTERNAL_ERROR',
    );
    return this.httpExceptionHandlerService.handleError(
      unknownException as CustomException,
      response,
      500,
    );
  }
}
