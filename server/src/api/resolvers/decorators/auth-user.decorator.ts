import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx);
    const request = gqlContext.getContext().req;
    return request.user;
  },
);

export type AuthUserType = {
  workspaceId: string;
  userId: string;
};
