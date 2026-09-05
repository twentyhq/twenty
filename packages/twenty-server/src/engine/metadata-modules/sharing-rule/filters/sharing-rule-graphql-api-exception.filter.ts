import { Catch, type ExceptionFilter } from '@nestjs/common';

import { SharingRuleException } from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';
import { sharingRuleGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/sharing-rule/utils/sharing-rule-graphql-api-exception-handler.util';

@Catch(SharingRuleException)
export class SharingRuleGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: SharingRuleException) {
    return sharingRuleGraphqlApiExceptionHandler(exception);
  }
}
