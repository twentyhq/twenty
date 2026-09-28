import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Injectable()
export class GraphQLRefuseSuspendedWorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly middlewareService: MiddlewareService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!isWorkspaceSuspended(req.workspace)) {
      next();

      return;
    }

    this.middlewareService.writeGraphqlResponseOnExceptionCaught(
      res,
      new AuthException(
        'Workspace is suspended',
        AuthExceptionCode.WORKSPACE_SUSPENDED,
      ),
    );
  }
}
