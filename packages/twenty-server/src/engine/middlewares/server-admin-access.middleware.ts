import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

// Backstop for the whole admin schema: when configured, off-host or Access-less requests are refused even without a guard.
@Injectable()
export class ServerAdminAccessMiddleware implements NestMiddleware {
  constructor(
    private readonly serverAdminAccessService: ServerAdminAccessService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    if (
      await this.serverAdminAccessService.isRequestAllowed({
        request,
        userEmail: request.user?.email,
      })
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
