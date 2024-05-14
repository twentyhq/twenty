import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { JwtData } from 'src/engine/core-modules/auth/types/jwt-data.type';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';

@Injectable()
export class GraphQLHydrateRequestFromTokenMiddleware
  implements NestMiddleware
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
      'IntrospectionQuery',
    ];

    if (
      !this.tokenService.isTokenPresent(req) &&
      (!body?.operationName || excludedOperations.includes(body.operationName))
    ) {
      return next();
    }

    let data: JwtData;

    try {
      data = await this.tokenService.validateToken(req);
      const cacheVersion = await this.workspaceCacheVersionService.getVersion(
        data.workspace.id,
      );

      req.user = data.user;
      req.workspace = data.workspace;
      req.cacheVersion = cacheVersion;
    } catch (error) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(
        JSON.stringify({
          errors: [
            handleExceptionAndConvertToGraphQLError(
              error,
              this.exceptionHandlerService,
            ),
          ],
        }),
      );
      res.end();

      return;
    }

    next();
  }
}
