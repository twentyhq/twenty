import {
  Controller,
  Get,
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

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FrontComponentRestApiExceptionFilter } from 'src/engine/metadata-modules/front-component/filters/front-component-rest-api-exception.filter';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';

@Controller('rest/front-components')
@UseGuards(WorkspaceAuthGuard)
@UseFilters(FrontComponentRestApiExceptionFilter)
export class FrontComponentController {
  constructor(private readonly frontComponentService: FrontComponentService) {}

  @Get(':frontComponentId')
  @UseGuards(NoPermissionGuard)
  async getBuiltJs(
    @Res() res: Response,
    @Param('frontComponentId') frontComponentId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    try {
      const fileStream =
        await this.frontComponentService.getBuiltComponentStream({
          frontComponentId,
          workspaceId: workspace.id,
        });

      res.setHeader('Content-Type', 'application/javascript');

      await pipeline(fileStream, res);
    } catch (error) {
      // Mid-stream error: client already received partial data, nothing to do
      if (res.headersSent) {
        return;
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

      if (error instanceof FrontComponentException) {
        throw error;
      }

      throw new FrontComponentException(
        `Error retrieving front component built file: ${error.message}`,
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_READY,
      );
    }
  }
}
