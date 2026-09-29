import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';

@MetadataResolver(() => PermissionFlagDTO)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.ROLES),
)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class PermissionFlagResolver {
  constructor(private readonly permissionFlagService: PermissionFlagService) {}

  @Query(() => [PermissionFlagDTO])
  async getPermissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO[]> {
    return this.permissionFlagService.findAll(workspace.id);
  }
}
