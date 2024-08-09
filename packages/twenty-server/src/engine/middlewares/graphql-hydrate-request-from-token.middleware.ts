import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';

class GraphqlTokenValidationProxy {
  private tokenService: TokenService;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
  }

  async validateToken(req: Request) {
    try {
      return await this.tokenService.validateToken(req);
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
      'EmailPasswordResetLink',
      'ValidatePasswordResetToken',
      'UpdatePasswordViaResetToken',
      'IntrospectionQuery',
      'ExchangeAuthorizationCode',
    ];

    if (
      !this.tokenService.isTokenPresent(req) &&
      (!body?.operationName || excludedOperations.includes(body.operationName))
    ) {
      return next();
    }

    let data: AuthContext;

    try {
      const graphqlTokenValidationProxy = new GraphqlTokenValidationProxy(
        this.tokenService,
      );

      data = await graphqlTokenValidationProxy.validateToken(req);
      const cacheVersion = await this.workspaceCacheVersionService.getVersion(
        data.workspace.id,
      );

      req.user = data.user;
      req.apiKey = data.apiKey;
      req.workspace = data.workspace;
      req.workspaceId = data.workspace.id;
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
