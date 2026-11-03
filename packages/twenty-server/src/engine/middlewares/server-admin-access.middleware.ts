import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

// Route-level backstop: the whole admin schema is refused off the admin host or without Access,
// even for a resolver that forgot its admin guard.
@Injectable()
export class ServerAdminAccessMiddleware implements NestMiddleware {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    if (
      await this.serverAdminAccessService.isRequestAllowed(
        request,
        request.user?.email,
      )
    ) {
      next();

      return;
    }

    this.middlewareService.writeGraphqlResponseOnExceptionCaught(
      response,
      new AuthException(
        'Server administration is not allowed for this request',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  }
}
