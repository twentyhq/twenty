import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { PassportUser } from 'src/core/auth/strategies/jwt.auth.strategy';
import { getRequest } from 'src/utils/extract-request';

type PassportUserOrFalse = PassportUser | false;

@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt']) {
  constructor() {
    super();
  }

  getRequest(context: ExecutionContext) {
    const request = getRequest(context);

    return request;
  }

  handleRequest<PassportUserOrFalse>(
    err: any,
    user: PassportUserOrFalse,
    info: any,
  ) {
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
