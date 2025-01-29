import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { EXCLUDED_MIDDLEWARE_OPERATIONS } from 'src/engine/middlewares/constants/excluded-middleware-operations.constant';
import { GraphqlTokenValidationProxy } from 'src/engine/middlewares/utils/graphql-token-validation-utils';
import { handleExceptionAndConvertToGraphQLError } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class MiddlewareService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private excludedOperations = EXCLUDED_MIDDLEWARE_OPERATIONS;

  public isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }

  public checkUnauthenticatedAccess(request: Request): boolean {
    const { body } = request;

    const isUserUnauthenticated = !this.isTokenPresent(request);
    const isExcludedOperation =
      !body?.operationName ||
      this.excludedOperations.includes(body.operationName);

    return isUserUnauthenticated && isExcludedOperation;
  }

  public writeRestResponseOnExceptionCaught(res: Response, error: any) {
    const errors = [handleException(error, this.exceptionHandlerService)];
    const getStatus = () => {
      if (this.hasErrorStatus(error)) {
        return error.status;
      }

      return 500;
    };

    const statusCode = getStatus();

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        errors,
      }),
    );

    res.end();
  }

  public writeGraphqlResponseOnExceptionCaught(res: Response, error: unknown) {
    const errors = [
      handleExceptionAndConvertToGraphQLError(
        error as Error,
        this.exceptionHandlerService,
      ),
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        errors,
      }),
    );

    res.end();
  }

  public async authenticateRestRequest(request: Request) {
    const data = await this.accessTokenService.validateTokenByRequest(request);
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

    this.bindDataToRequestObject(data, request, metadataVersion);
  }

  public async authenticateGraphqlRequest(request: Request) {
    const graphqlTokenValidationProxy = new GraphqlTokenValidationProxy(
      this.accessTokenService,
    );

    const data = await graphqlTokenValidationProxy.validateToken(request);
    const metadataVersion =
      await this.workspaceStorageCacheService.getMetadataVersion(
        data.workspace.id,
      );

    this.bindDataToRequestObject(data, request, metadataVersion);
  }

  private hasErrorStatus(error: unknown): error is { status: number } {
    return isDefined((error as { status: number })?.status);
  }

  private bindDataToRequestObject(
    data: AuthContext,
    request: Request,
    metadataVersion: number | undefined,
  ) {
    request.user = data.user;
    request.apiKey = data.apiKey;
    request.workspace = data.workspace;
    request.workspaceId = data.workspace.id;
    request.workspaceMetadataVersion = metadataVersion;
    request.workspaceMemberId = data.workspaceMemberId;
  }
}
