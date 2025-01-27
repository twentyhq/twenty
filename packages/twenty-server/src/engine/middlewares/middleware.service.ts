import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { EXCLUDED_MIDDLEWARE_OPERATIONS } from 'src/engine/middlewares/constants/excluded-middleware-operations.constant';
import { bindDataToRequestObject } from 'src/engine/middlewares/utils/bind-data-to-request-object.utils';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class MiddlewareService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly dataSourceService: DataSourceService,
  ) {}

  public excludedOperations = EXCLUDED_MIDDLEWARE_OPERATIONS;

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

  public writeResponseOnExceptionCaught(
    res: Response,
    source: 'rest' | 'graphql',
    error: unknown,
    errors: unknown[],
  ) {
    const getStatus = () => {
      if (source === 'graphql') {
        return 200;
      }

      if (this.hasErrorStatus(error)) {
        return error.status;
      }

      return 500;
    };

    res.writeHead(getStatus(), { 'Content-Type': 'application/json' });
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

    bindDataToRequestObject(data, request, metadataVersion);
  }

  private hasErrorStatus(error: unknown): error is { status: number } {
    return isDefined((error as { status: number }).status);
  }
}
