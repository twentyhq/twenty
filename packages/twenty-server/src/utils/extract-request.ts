import { type ExecutionContext } from '@nestjs/common';
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

export const getRequest = (context: ExecutionContext) => {
  let request;

  if (context.getType() === 'http') {
    request = context.switchToHttp().getRequest();
  } else if (context.getType<GqlContextType>() === 'graphql') {
    const graphQLContext = GqlExecutionContext.create(context);

    const { req, connection } = graphQLContext.getContext();

    request =
      connection && connection.context && connection.context.headers
        ? connection.context
        : req;
  } else if (context.getType() === 'rpc') {
    throw new Error('Not implemented');
  }

  return request;
};
