import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerOptionsFactory,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { getRequest } from 'src/utils/extract-request';

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
        generateKey: (context: ExecutionContext) => {
          const request = getRequest(context);

          if (request.user) {
            return request.user;
          }

          return request;
        },
      },
    ];
  }
}
