import { Catch, type ExceptionFilter } from '@nestjs/common';

import { validationRuleGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/validation-rule/utils/validation-rule-graphql-api-exception-handler.util';
import { ValidationRuleException } from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';

@Catch(ValidationRuleException)
export class ValidationRuleGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationRuleException) {
    return validationRuleGraphqlApiExceptionHandler(exception);
  }
}
