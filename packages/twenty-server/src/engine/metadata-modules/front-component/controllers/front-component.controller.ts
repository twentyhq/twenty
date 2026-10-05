import { Controller, Get, Logger, Res, UseGuards } from '@nestjs/common';

import { pipeline } from 'stream/promises';

import { Response } from 'express';
import { ApiPath, FileFolder } from 'twenty-shared/types';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { PRESIGNED_URL_NO_STORE_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetParam } from 'src/engine/decorators/auth/application-target-param.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

@Controller(`${ApiPath.Rest}/front-components`)
@AllowSuspendedWorkspace()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
)
export class FrontComponentController {
  private readonly logger = new Logger(FrontComponentController.name);

  constructor(private readonly frontComponentService: FrontComponentService) {}

  @Get([':frontComponentId', ':frontComponentId/:cacheKey'])
  @UseGuards(NoPermissionGuard, ApplicationTargetGuard)
  async getBuiltJs(
    @Res() res: Response,
    @ApplicationTargetParam('frontComponentId', {
      kind: 'applicationOwnedEntity',
      metadataName: 'frontComponent',
      requireApplicationRegistrationOwnership: false,
    })
    frontComponentId: string,
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
      res.setHeader('Cache-Control', PRESIGNED_URL_NO_STORE_CACHE_CONTROL);

      return res.json({ url: fileResponse.presignedUrl });
    }

    setFileResponseHeaders(
      res,
      fileResponse.mimeType,
      FileFolder.BuiltFrontComponent,
    );

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      fileResponse.stream.destroy();
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
