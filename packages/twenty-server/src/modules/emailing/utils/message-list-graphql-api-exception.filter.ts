import { type ArgumentsHost, Catch } from '@nestjs/common';
import { type GqlExceptionFilter } from '@nestjs/graphql';

import { MessageListException } from 'src/modules/emailing/exceptions/message-list.exception';
import { messageListGraphqlApiExceptionHandler } from 'src/modules/emailing/utils/message-list-graphql-api-exception-handler.util';

@Catch(MessageListException)
export class MessageListGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(exception: MessageListException, _host: ArgumentsHost) {
    return messageListGraphqlApiExceptionHandler(exception);
  }
}
