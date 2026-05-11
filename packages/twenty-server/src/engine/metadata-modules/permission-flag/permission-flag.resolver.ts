import {
  ForbiddenException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { UpdatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/update-permission-flag.input';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { PermissionFlagGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permission-flag/utils/permission-flag-graphql-api-exception.filter';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseFilters(PermissionFlagGraphqlApiExceptionFilter)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => PermissionFlagDTO)
export class PermissionFlagResolver {
  constructor(
    private readonly permissionFlagService: PermissionFlagService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async assertCustomPermissionFlagGrantsEnabled(
    workspaceId: string,
  ): Promise<void> {
    const isEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CUSTOM_PERMISSION_FLAGS_ENABLED,
      workspaceId,
    );

    if (!isEnabled) {
      throw new ForbiddenException(
        'Custom permission flag definitions are not enabled for this workspace',
      );
    }
  }

  @Query(() => [PermissionFlagDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async permissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO[]> {
    return await this.permissionFlagService.findAll(workspace.id);
  }

  @Query(() => PermissionFlagDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async permissionFlag(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO | null> {
    return await this.permissionFlagService.findById(
      id,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async createPermissionFlag(
    @Args('input') input: CreatePermissionFlagInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO> {
    await this.assertCustomPermissionFlagGrantsEnabled(workspace.id);

    return await this.permissionFlagService.create(
      input,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async updatePermissionFlag(
    @Args('input') input: UpdatePermissionFlagInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO> {
    await this.assertCustomPermissionFlagGrantsEnabled(workspace.id);

    return await this.permissionFlagService.update(
      input,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async deletePermissionFlag(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDTO> {
    await this.assertCustomPermissionFlagGrantsEnabled(workspace.id);

    return await this.permissionFlagService.delete(id, workspace.id);
  }
}
