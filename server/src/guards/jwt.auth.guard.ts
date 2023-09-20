import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JsonWebTokenError } from 'jsonwebtoken';

import { assert } from 'src/utils/assert';
import { getRequest } from 'src/utils/extract-request';

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = getRequest(context);

    console.log('REQUEST: ', request);

    return request;
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('handleRerquest: ', err, user, info);
    assert(user, '', UnauthorizedException);

    if (err) {
      throw err;
    }

    if (info && info instanceof Error) {
      if (info instanceof JsonWebTokenError) {
        info = String(info);
      }

      throw new UnauthorizedException(info);
    }

    return user;
  }
}
