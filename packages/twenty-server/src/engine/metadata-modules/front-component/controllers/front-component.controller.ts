import {
  Controller,
  Get,
  Logger,
  Param,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { pipeline } from 'stream/promises';

import { Response } from 'express';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FlatEntityMapsRestApiExceptionFilter } from 'src/engine/metadata-modules/flat-entity/filters/flat-entity-maps-rest-api-exception.filter';
import { FrontComponentRestApiExceptionFilter } from 'src/engine/metadata-modules/front-component/filters/front-component-rest-api-exception.filter';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { PermissionsRestApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-rest-api-exception.filter';
import { WorkspaceMigrationRunnerRestApiExceptionFilter } from 'src/engine/workspace-manager/workspace-migration/filters/workspace-migration-runner-rest-api-exception.filter';

@Controller('rest/front-components')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(
  PermissionsRestApiExceptionFilter,
  FrontComponentRestApiExceptionFilter,
  FlatEntityMapsRestApiExceptionFilter,
  WorkspaceMigrationRunnerRestApiExceptionFilter,
)
export class FrontComponentController {
  private readonly logger = new Logger(FrontComponentController.name);

  constructor(private readonly frontComponentService: FrontComponentService) {}

  @Get(':frontComponentId')
  @UseGuards(NoPermissionGuard)
  async getBuiltJs(
    @Res() res: Response,
    @Param('frontComponentId') frontComponentId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const fileResponse = await this.frontComponentService
      .getBuiltComponentPresignedUrlOrStream({
        frontComponentId,
        workspaceId: workspace.id,
      })
      .catch((error) => {
        if (error instanceof FrontComponentException) {
          throw error;
        }

        if (
          error instanceof FileStorageException &&
          error.code === FileStorageExceptionCode.FILE_NOT_FOUND
        ) {
          throw new FrontComponentException(
            'Front component built file not found',
            FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
          );
        }

        this.logger.error(
          'getBuiltComponentPresignedUrlOrStream failed unexpectedly',
          { error },
        );

        throw new FrontComponentException(
          'Error retrieving front component built file',
          FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY,
        );
      });

    if (fileResponse.type === 'redirect') {
      return res.redirect(fileResponse.presignedUrl);
    }

    setFileResponseHeaders(res, fileResponse.mimeType);

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error('Front component stream failed mid-transfer', {
        error,
      });

      if (!res.headersSent) {
        throw new FrontComponentException(
          'Error streaming front component built file',
          FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY,
        );
      }

      res.destroy();
    }
  }
}
