import { Controller, Get, UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';

import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { MetadataService } from './metadata.service';

@UseGuards(JwtAuthGuard)
@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  async getMetadata(@AuthWorkspace() workspace: Workspace) {
    return this.metadataService.fetchMetadataFromWorkspaceId(workspace.id);
  }
}
