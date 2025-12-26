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
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { fromWorkspaceMigrationBuilderExceptionToMetadataValidationResponseError } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/utils/from-workspace-migration-builder-exception-to-metadata-validation-response-error.util';
import {
  type CustomException,
  UnknownException,
} from 'src/utils/custom-exception';

@Injectable()
@Catch(ViewException, WorkspaceMigrationBuilderExceptionV2)
export class ViewRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(
    exception: ViewException | WorkspaceMigrationBuilderExceptionV2,
    host: ArgumentsHost,
  ) {
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

    if (exception instanceof ViewException) {
      switch (exception.code) {
        case ViewExceptionCode.VIEW_NOT_FOUND:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            404,
          );
        case ViewExceptionCode.INVALID_VIEW_DATA:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            400,
          );
        case ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            403,
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
