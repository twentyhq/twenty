import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { QueryFailedError } from 'typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { sendHttpExceptionResponse } from 'src/engine/core-modules/exception-handler/utils/send-http-exception-response.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-graphql-api-exception-handler.util';
import { workspaceMigrationBuilderRestApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-rest-api-exception-handler.util';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Catch(WorkspaceMigrationBuilderException, WorkspaceMigrationRunnerException)
export class WorkspaceMigrationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(
    exception:
      | WorkspaceMigrationBuilderException
      | WorkspaceMigrationRunnerException,
    host: ArgumentsHost,
  ) {
    if (host.getType<GqlContextType>() === 'graphql') {
      return exception instanceof WorkspaceMigrationBuilderException
        ? workspaceMigrationBuilderGraphqlApiExceptionHandler(exception)
        : workspaceMigrationRunnerExceptionFormatter(exception);
    }

    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof WorkspaceMigrationBuilderException) {
      return workspaceMigrationBuilderRestApiExceptionHandler({
        exception,
        response,
        i18n: this.i18nService.getI18nInstance(SOURCE_LOCALE),
      });
    }

    const underlyingError =
      exception.code === WorkspaceMigrationRunnerExceptionCode.EXECUTION_FAILED
        ? (exception.errors?.metadata ??
          exception.errors?.workspaceSchema ??
          exception.errors?.actionTranspilation)
        : undefined;

    return sendHttpExceptionResponse({
      exception:
        underlyingError instanceof QueryFailedError
          ? underlyingError
          : exception,
      response,
      exceptionHandlerService: this.exceptionHandlerService,
    });
  }
}
