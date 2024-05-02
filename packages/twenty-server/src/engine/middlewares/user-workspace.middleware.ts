import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

@Injectable()
export class UserWorkspaceMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const excludedOperations = [
      'GetClientConfig',
      'GetCurrentUser',
      'GetWorkspaceFromInviteHash',
      'Track',
      'CheckUserExists',
      'Challenge',
      'Verify',
      'SignUp',
      'RenewToken',
    ];

    if (
      body &&
      body.operationName &&
      excludedOperations.includes(body.operationName)
    ) {
      return next();
    }

    const data = await this.tokenService.validateToken(req);
    const cacheVersion = await this.workspaceCacheVersionService.getVersion(
      data.workspace.id,
    );

    req.user = data.user;
    req.workspace = data.workspace;
    req.cacheVersion = cacheVersion;

    next();
  }
}
