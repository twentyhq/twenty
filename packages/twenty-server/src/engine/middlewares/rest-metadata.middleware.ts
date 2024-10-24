import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class RestMetadataMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
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
      'GetAuthorizationUrl',
      'FindAvailableSSOIdentityProviders',
    ];

    if (
      !this.tokenService.isTokenPresent(req) &&
      (!body?.operationName || excludedOperations.includes(body.operationName))
    ) {
      return next();
    }

    let data: AuthContext;

    try {
      data = await this.tokenService.validateToken(req);
      const metadataVersion =
        await this.workspaceStorageCacheService.getMetadataVersion(
          data.workspace.id,
        );

      if (metadataVersion === undefined) {
        await this.workspaceMetadataCacheService.recomputeMetadataCache({
          workspaceId: data.workspace.id,
        });
        throw new Error('Metadata cache version not found');
      }

      const dataSourcesMetadata =
        await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
          data.workspace.id,
        );

      if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
        throw new Error('No data sources found');
      }

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
          errors: [handleException(error, this.exceptionHandlerService)],
        }),
      );
      res.end();

      return;
    }

    next();
  }
}
