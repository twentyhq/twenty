import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';

@MetadataResolver(() => PermissionFlagDTO)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class PermissionFlagResolver {
  constructor(private readonly permissionFlagService: PermissionFlagService) {}

  @UseGuards(NoPermissionGuard)
  @Query(() => [PermissionFlagDTO])
  @AllowSuspendedWorkspace()
  async getPermissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO[]> {
    return this.permissionFlagService.findAll(workspace.id);
  }
}
