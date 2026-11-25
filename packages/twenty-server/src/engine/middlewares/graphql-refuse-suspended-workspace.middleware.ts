import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Injectable()
export class GraphQLRefuseSuspendedWorkspaceMiddleware implements NestMiddleware {
  constructor(private readonly middlewareService: MiddlewareService) {}

  use(
    req: { workspace?: Pick<FlatWorkspace, 'activationStatus' | 'deletedAt'> },
    res: Response,
    next: NextFunction,
  ) {
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
