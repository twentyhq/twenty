import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client-generation/sdk-client-generation.service';

const ALLOWED_SDK_MODULES = ['core', 'metadata'] as const;

type SdkModuleName = (typeof ALLOWED_SDK_MODULES)[number];

@Controller('rest/sdk-client')
@UseGuards(WorkspaceAuthGuard)
export class SdkClientController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly sdkClientGenerationService: SdkClientGenerationService,
  ) {}

  @Get(':applicationId/:moduleName')
  @UseGuards(NoPermissionGuard)
  async getSdkModule(
    @Res() res: Response,
    @Param('applicationId') applicationId: string,
    @Param('moduleName') moduleName: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (
      !ALLOWED_SDK_MODULES.includes(moduleName as SdkModuleName)
    ) {
      throw new NotFoundException(
        `SDK module "${moduleName}" not found. Allowed: ${ALLOWED_SDK_MODULES.join(', ')}`,
      );
    }

    const application =
      await this.applicationService.findOneApplicationOrThrow({
        id: applicationId,
        workspaceId: workspace.id,
      });

    const fileBuffer =
      await this.sdkClientGenerationService.readFileFromArchive({
        workspaceId: workspace.id,
        applicationUniversalIdentifier: application.universalIdentifier,
        filePath: `dist/${moduleName}.mjs`,
      });

    res.setHeader('Content-Type', 'application/javascript');
    res.send(fileBuffer);
  }
}
