import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';
import { bindDataToRequestObject } from 'src/engine/middlewares/utils/bind-data-to-request-object.utils';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
class GraphqlTokenValidationProxy {
  private accessTokenService: AccessTokenService;

  constructor(accessTokenService: AccessTokenService) {
    this.accessTokenService = accessTokenService;
  }

  async validateToken(req: Request) {
    try {
      return await this.accessTokenService.validateTokenByRequest(req);
    } catch (error) {
      const authGraphqlApiExceptionFilter = new AuthGraphqlApiExceptionFilter();

      throw authGraphqlApiExceptionFilter.catch(error);
    }
  }
}

@Injectable()
export class GraphQLHydrateRequestFromTokenMiddleware
  implements NestMiddleware
{
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (this.middlewareService.checkUnauthenticatedAccess(req)) {
      return next();
    }

    let data: AuthContext;

    try {
      const graphqlTokenValidationProxy = new GraphqlTokenValidationProxy(
        this.accessTokenService,
      );

      data = await graphqlTokenValidationProxy.validateToken(req);
      const metadataVersion =
        await this.workspaceStorageCacheService.getMetadataVersion(
          data.workspace.id,
        );

      bindDataToRequestObject(data, req, metadataVersion);
    } catch (error) {
      this.middlewareService.writeGraphqlResponseOnExceptionCaught(res, error);

      return;
    }

    next();
  }
}
