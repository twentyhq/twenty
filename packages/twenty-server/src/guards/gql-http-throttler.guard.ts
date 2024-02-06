import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class GqlHttpThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const request = getRequest(context);

    return { req: request, res: request.res };
  }
}
