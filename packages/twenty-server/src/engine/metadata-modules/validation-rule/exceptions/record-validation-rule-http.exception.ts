import { HttpException, HttpStatus } from '@nestjs/common';

import { type HttpExceptionWithRestResponse } from 'src/engine/core-modules/exception-handler/types/http-exception-with-rest-response.type';
import {
  type RecordValidationRuleException,
  RecordValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/exceptions/record-validation-rule.exception';
import { type RecordValidationRuleViolation } from 'src/engine/metadata-modules/validation-rule/types/record-validation-rule-violation.type';

type RecordValidationRuleRestResponseBody = {
  statusCode: HttpStatus;
  error: string;
  messages: string[];
  code: string;
  validationRuleViolations: RecordValidationRuleViolation[];
};

export class RecordValidationRuleHttpException
  extends HttpException
  implements HttpExceptionWithRestResponse
{
  private readonly responseBody: RecordValidationRuleRestResponseBody;

  constructor(exception: RecordValidationRuleException) {
    const isEvaluationFailure =
      exception.code ===
      RecordValidationRuleExceptionCode.VALIDATION_RULE_EVALUATION_FAILED;
    const statusCode = isEvaluationFailure
      ? HttpStatus.INTERNAL_SERVER_ERROR
      : HttpStatus.BAD_REQUEST;

    const responseBody: RecordValidationRuleRestResponseBody = {
      statusCode,
      error: isEvaluationFailure
        ? 'InternalServerErrorException'
        : 'BadRequestException',
      messages: [exception.message],
      code: exception.code,
      validationRuleViolations: exception.violations,
    };

    super(responseBody, statusCode);
    this.message = exception.message;
    this.responseBody = responseBody;
  }

  getResponseBody(): RecordValidationRuleRestResponseBody {
    return this.responseBody;
  }

  getResponseHeaders(): Record<string, string> {
    return {};
  }
}
