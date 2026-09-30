import { Catch, type ExceptionFilter } from '@nestjs/common';

import { InputAskException } from 'src/modules/input-ask/input-ask.exception';
import { inputAskGraphqlApiExceptionHandler } from 'src/modules/input-ask/utils/input-ask-graphql-api-exception-handler.util';

@Catch(InputAskException)
export class InputAskGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: InputAskException) {
    return inputAskGraphqlApiExceptionHandler(exception);
  }
}
