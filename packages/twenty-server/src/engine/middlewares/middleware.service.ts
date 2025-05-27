import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { getAuthExceptionRestStatus } from 'src/engine/core-modules/auth/utils/get-auth-exception-rest-status.util';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { INTERNAL_SERVER_ERROR } from 'src/engine/middlewares/constants/default-error-message.constant';
import { EXCLUDED_MIDDLEWARE_OPERATIONS } from 'src/engine/middlewares/constants/excluded-middleware-operations.constant';
import { GraphqlTokenValidationProxy } from 'src/engine/middlewares/utils/graphql-token-validation-utils';
import {
  handleException,
  handleExceptionAndConvertToGraphQLError,
} from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class MiddlewareService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly dataSourceService: DataSourceService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  private excludedOperations = EXCLUDED_MIDDLEWARE_OPERATIONS;

  public isTokenPresent(request: Request): boolean {
    const token = this.jwtWrapperService.extractJwtFromRequest()(request);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeRestResponseOnExceptionCaught(res: Response, error: any) {
    const statusCode = this.getStatus(error);

    // capture and handle custom exceptions
    handleException({
      exception: error as CustomException,
      exceptionHandlerService: this.exceptionHandlerService,
      statusCode,
    });

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        statusCode,
        messages: [error?.message || INTERNAL_SERVER_ERROR],
        error: error?.code || ErrorCode.INTERNAL_SERVER_ERROR,
      }),
    );

    res.end();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeGraphqlResponseOnExceptionCaught(res: Response, error: any) {
    const errors = [
      handleExceptionAndConvertToGraphQLError(
        error as Error,
        this.exceptionHandlerService,
      ),
    ];

    const statusCode = 200;

    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
    });

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
    request.userWorkspaceId = data.userWorkspaceId;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getStatus(error: any): number {
    if (this.hasErrorStatus(error)) {
      return error.status;
    }

    if (error instanceof AuthException) {
      return getAuthExceptionRestStatus(error);
    }

    return 500;
  }
}
