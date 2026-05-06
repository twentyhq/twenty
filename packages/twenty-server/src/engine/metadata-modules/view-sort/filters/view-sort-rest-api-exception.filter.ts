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
  ViewSortException,
  ViewSortExceptionCode,
} from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderRestApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-rest-api-exception-handler.util';
import {
  type CustomException,
  UnknownException,
} from 'src/utils/custom-exception';

@Injectable()
@Catch(ViewSortException, WorkspaceMigrationBuilderException)
export class ViewSortRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(
    exception: ViewSortException | WorkspaceMigrationBuilderException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof WorkspaceMigrationBuilderException) {
      return workspaceMigrationBuilderRestApiExceptionHandler({
        exception,
        response,
        i18n: this.i18nService.getI18nInstance(SOURCE_LOCALE),
      });
    }

    if (exception instanceof ViewSortException) {
      switch (exception.code) {
        case ViewSortExceptionCode.VIEW_SORT_NOT_FOUND:
          return this.httpExceptionHandlerService.handleError(
            exception as CustomException,
            response,
            404,
          );
        case ViewSortExceptionCode.INVALID_VIEW_SORT_DATA:
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
