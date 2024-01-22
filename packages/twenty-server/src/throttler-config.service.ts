import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  ThrottlerOptionsFactory,
  ThrottlerModuleOptions,
} from '@nestjs/throttler/dist';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  constructor(private readonly environmentService: EnvironmentService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    const ttl = this.environmentService.getLoggedInLongTtl();
    const limit = this.environmentService.getLoggedInLongLimit();

    return [
      {
        ttl: ttl,
        limit: limit,
        name: 'LOGGED_IN_LONG',
        generateKey: (context: ExecutionContext) => {
          const requestType = GqlExecutionContext.create(context).getType();

          if (requestType === 'graphql') {
            const gqlCtx = GqlExecutionContext.create(context);
            const gqlReq = gqlCtx.getContext().req;

            return gqlReq.headers['x-custom-key'];
          } else {
            const req = context.switchToHttp().getRequest();

            if (req.user) {
              return req.user;
            }

            return req.ip;
          }
        },
      },
    ];
  }
}
