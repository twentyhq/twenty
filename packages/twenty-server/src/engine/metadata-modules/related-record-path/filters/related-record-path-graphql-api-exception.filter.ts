/* @license Enterprise */

import { Catch, type ExceptionFilter } from '@nestjs/common';

import { relatedRecordPathGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/related-record-path/utils/related-record-path-graphql-api-exception-handler.util';
import { RelatedRecordPathException } from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';

@Catch(RelatedRecordPathException)
export class RelatedRecordPathGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: RelatedRecordPathException) {
    return relatedRecordPathGraphqlApiExceptionHandler(exception);
  }
}
