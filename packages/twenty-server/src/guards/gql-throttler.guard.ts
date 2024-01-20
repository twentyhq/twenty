import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler/dist';

@Injectable()
export class GqlHttpThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const requestType = GqlExecutionContext.create(context).getType();

    if (requestType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();

      return { req: ctx.req, res: ctx.res };
    } else {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();

      return { req, res };
    }
  }
}
