import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard(['jwt']) {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = getRequest(context);
    return request;
  }

  handleRequest(err, user, info) {
    if (err || info) return null;
    return user;
  }
}
