import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { fieldMetadataExceptionCodeToHttpStatus } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-exception-code-to-http-status.util';
import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { flatEntityMapsExceptionCodeToHttpStatus } from 'src/engine/metadata-modules/flat-entity/utils/flat-entity-maps-exception-code-to-http-status.util';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderRestApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-rest-api-exception-handler.util';
import { type CustomException } from 'src/utils/custom-exception';

type CaughtException =
  | FieldMetadataException
  | InvalidMetadataException
  | WorkspaceMigrationBuilderException
  | RestInputRequestParserException
  | FlatEntityMapsException;

@Injectable()
@Catch(
  FieldMetadataException,
  InvalidMetadataException,
  WorkspaceMigrationBuilderException,
  RestInputRequestParserException,
  FlatEntityMapsException,
)
export class FieldMetadataRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpExceptionHandlerService: HttpExceptionHandlerService,
    private readonly i18nService: I18nService,
  ) {}

  catch(exception: CaughtException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof WorkspaceMigrationBuilderException) {
      return workspaceMigrationBuilderRestApiExceptionHandler({
        exception,
        response,
        i18n: this.i18nService.getI18nInstance(SOURCE_LOCALE),
      });
    }

    if (
      exception instanceof InvalidMetadataException ||
      exception instanceof RestInputRequestParserException
    ) {
      return this.httpExceptionHandlerService.handleError(
        exception as CustomException,
        response,
        400,
      );
    }

    if (exception instanceof FlatEntityMapsException) {
      return this.httpExceptionHandlerService.handleError(
        exception as CustomException,
        response,
        flatEntityMapsExceptionCodeToHttpStatus(exception.code),
      );
    }

    if (exception instanceof FieldMetadataException) {
      return this.httpExceptionHandlerService.handleError(
        exception as CustomException,
        response,
        fieldMetadataExceptionCodeToHttpStatus(exception.code),
      );
    }

    return this.httpExceptionHandlerService.handleError(
      exception,
      response,
      500,
    );
  }
}
