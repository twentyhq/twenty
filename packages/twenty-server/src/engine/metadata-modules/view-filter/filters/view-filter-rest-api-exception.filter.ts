import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';
import {
  type CustomException,
  UnknownException,
} from 'src/utils/custom-exception';

@Injectable()
@Catch(ViewFilterException, WorkspaceMigrationBuilderException)
export class ViewFilterRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(
    exception: ViewFilterException | WorkspaceMigrationBuilderException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof WorkspaceMigrationBuilderException) {
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

    if (exception instanceof ViewFilterException) {
      switch (exception.code) {
        case ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            404,
          );
        case ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA:
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

    // Fallback for any other exception type
    const unknownException = new UnknownException(
      'Internal server error',
      'INTERNAL_ERROR',
      { userFriendlyMessage: msg`An unexpected error occurred.` },
    );

    return this.httpExceptionHandlerService.handleError(
      unknownException as CustomException,
      response,
      500,
    );
  }
}
