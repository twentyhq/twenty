import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

@Injectable()
export class UserWorkspaceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserWorkspaceMiddleware.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (this.tokenService.isTokenPresent(req)) {
      try {
        const data = await this.tokenService.validateToken(req);
        const cacheVersion = await this.workspaceCacheVersionService.getVersion(
          data.workspace.id,
        );

        req.user = data.user;
        req.workspace = data.workspace;
        req.cacheVersion = cacheVersion;
      } catch (error) {
        this.logger.error('Error while validating token in middleware.', error);
      }
    }
    next();
  }
}
