import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = getRequest(context);

    return request;
  }
}
