import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { CommonMiddlewareOperationsService } from 'src/engine/middlewares/common/common-middleware-operations.service';
import { bindDataToRequestObject } from 'src/engine/middlewares/utils/bind-data-to-request-object.utils';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class RestCoreMiddleware implements NestMiddleware {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly commonMiddlewareOperationsService: CommonMiddlewareOperationsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { body } = req;

    if (
      !this.commonMiddlewareOperationsService.isTokenPresent(req) &&
      (!body?.operationName ||
        this.commonMiddlewareOperationsService.excludedOperations.includes(
          body.operationName,
        ))
    ) {
      return next();
    }

    let data: AuthContext;

    try {
      data = await this.accessTokenService.validateTokenByRequest(req);
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

      bindDataToRequestObject(data)(req, metadataVersion);
    } catch (error) {
      const errors = [handleException(error, this.exceptionHandlerService)];

      this.commonMiddlewareOperationsService.writeResponseOnExceptionCaught(
        res,
        'rest',
        error,
        errors,
      );

      return;
    }

    next();
  }
}
