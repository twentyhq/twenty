import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';
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
      'GetLoginTokenFromEmailVerificationToken',
      'ResendEmailVerificationToken',
      'SignUp',
      'RenewToken',
      'EmailPasswordResetLink',
      'ValidatePasswordResetToken',
      'UpdatePasswordViaResetToken',
      'IntrospectionQuery',
      'ExchangeAuthorizationCode',
      'GetAuthorizationUrl',
      'GetPublicWorkspaceDataBySubdomain',
    ];

    if (
      !this.isTokenPresent(req) &&
      (!body?.operationName || excludedOperations.includes(body.operationName))
    ) {
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

      req.user = data.user;
      req.apiKey = data.apiKey;
      req.workspace = data.workspace;
      req.workspaceId = data.workspace.id;
      req.workspaceMetadataVersion = metadataVersion;
      req.workspaceMemberId = data.workspaceMemberId;
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

  isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }
}
