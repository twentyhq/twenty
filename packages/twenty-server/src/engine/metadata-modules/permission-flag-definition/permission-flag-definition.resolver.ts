import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/create-permission-flag-definition.input';
import { PermissionFlagDefinitionDTO } from 'src/engine/metadata-modules/permission-flag-definition/dtos/permission-flag-definition.dto';
import { UpdatePermissionFlagDefinitionInput } from 'src/engine/metadata-modules/permission-flag-definition/dtos/update-permission-flag-definition.input';
import { PermissionFlagDefinitionService } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.service';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => PermissionFlagDefinitionDTO)
export class PermissionFlagDefinitionResolver {
  constructor(
    private readonly permissionFlagDefinitionService: PermissionFlagDefinitionService,
  ) {}

  @Query(() => [PermissionFlagDefinitionDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async permissionFlagDefinitions(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDefinitionDTO[]> {
    return await this.permissionFlagDefinitionService.findAll(workspace.id);
  }

  @Query(() => PermissionFlagDefinitionDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async permissionFlagDefinition(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDefinitionDTO | null> {
    return await this.permissionFlagDefinitionService.findById(
      id,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDefinitionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async createPermissionFlagDefinition(
    @Args('input') input: CreatePermissionFlagDefinitionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDefinitionDTO> {
    return await this.permissionFlagDefinitionService.create(
      input,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDefinitionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async updatePermissionFlagDefinition(
    @Args('input') input: UpdatePermissionFlagDefinitionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDefinitionDTO> {
    return await this.permissionFlagDefinitionService.update(
      input,
      workspace.id,
    );
  }

  @Mutation(() => PermissionFlagDefinitionDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.ROLES))
  async deletePermissionFlagDefinition(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<PermissionFlagDefinitionDTO> {
    return await this.permissionFlagDefinitionService.delete(id, workspace.id);
  }
}
