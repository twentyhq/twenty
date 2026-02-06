import { Catch, type ExceptionFilter, Injectable } from '@nestjs/common';

import {
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';

@Catch(FlatEntityMapsException)
@Injectable()
export class FlatEntityMapsGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: FlatEntityMapsException) {
    switch (exception.code) {
      case FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND:
        throw new NotFoundError(exception);
      case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
      case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
      case FlatEntityMapsExceptionCode.ENTITY_MALFORMED:
      case FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR:
        throw new InternalServerError(exception);
    }
  }
}
