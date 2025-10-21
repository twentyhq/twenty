import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentRoleService } from 'src/engine/metadata-modules/agent-role/agent-role.service';
import { AgentDTO } from 'src/engine/metadata-modules/agent/dtos/agent.dto';
import { FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';
import { UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/permission-flag/dtos/upsert-permission-flag-input';
import { PermissionFlagService } from 'src/engine/metadata-modules/permission-flag/permission-flag.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import {
  ApiKeyForRoleDTO,
  RoleDTO,
} from 'src/engine/metadata-modules/role/dtos/role.dto';
import { UpdateRoleInput } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Resolver(() => RoleDTO)
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionsGuard(PermissionFlagType.ROLES),
)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class RoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly settingPermissionService: PermissionFlagService,
    private readonly agentRoleService: AgentRoleService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly fieldPermissionService: FieldPermissionService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RoleDTO[]> {
    return this.roleService.getWorkspaceRoles(workspace.id);
  }

  @Mutation(() => WorkspaceMemberDTO)
  @UseGuards(UserAuthGuard)
  async updateWorkspaceMemberRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workspaceMemberId', { type: () => UUIDScalarType })
    workspaceMemberId: string,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
    @AuthWorkspaceMemberId()
    updatorWorkspaceMemberId: string,
  ): Promise<WorkspaceMemberDTO> {
    if (updatorWorkspaceMemberId === workspaceMemberId) {
      throw new PermissionsException(
        PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
        PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
        {
          userFriendlyMessage: msg`You cannot change your own role. Please ask another administrator to update your role.`,
        },
      );
    }

    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId: workspace.id,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId: workspace.id,
      });

    await this.userRoleService.assignRoleToUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId: workspace.id,
      roleId,
    });

    const roles = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspace.id],
        workspaceId: workspace.id,
      })
      .then(
        (rolesByUserWorkspaces) =>
          rolesByUserWorkspaces?.get(userWorkspace.id) ?? [],
      );

    return {
      ...workspaceMember,
      userWorkspaceId: userWorkspace.id,
      roles,
    } as WorkspaceMemberDTO;
  }

  @Mutation(() => RoleDTO)
  async createOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('createRoleInput') createRoleInput: CreateRoleInput,
  ): Promise<RoleDTO> {
    return await this.roleService.createRole({
      workspaceId: workspace.id,
      input: createRoleInput,
    });
  }

  @Mutation(() => RoleDTO)
  async updateOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
  ): Promise<RoleDTO> {
    const role = await this.roleService.updateRole({
      input: updateRoleInput,
      workspaceId: workspace.id,
    });

    return role;
  }

  @Mutation(() => String)
  async deleteOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
  ): Promise<string> {
    const deletedRoleId = await this.roleService.deleteRole(
      roleId,
      workspace.id,
    );

    return deletedRoleId;
  }

  @Mutation(() => [ObjectPermissionDTO])
  async upsertObjectPermissions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertObjectPermissionsInput')
    upsertObjectPermissionsInput: UpsertObjectPermissionsInput,
  ): Promise<ObjectPermissionDTO[]> {
    return this.objectPermissionService.upsertObjectPermissions({
      workspaceId: workspace.id,
      input: upsertObjectPermissionsInput,
    });
  }

  @Mutation(() => [PermissionFlagDTO])
  async upsertPermissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertPermissionFlagsInput')
    upsertPermissionFlagsInput: UpsertPermissionFlagsInput,
  ): Promise<PermissionFlagDTO[]> {
    return this.settingPermissionService.upsertPermissionFlags({
      workspaceId: workspace.id,
      input: upsertPermissionFlagsInput,
    });
  }

  @Mutation(() => [FieldPermissionDTO])
  async upsertFieldPermissions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertFieldPermissionsInput')
    upsertFieldPermissionsInput: UpsertFieldPermissionsInput,
  ): Promise<FieldPermissionDTO[]> {
    return this.fieldPermissionService.upsertFieldPermissions({
      workspaceId: workspace.id,
      input: upsertFieldPermissionsInput,
    });
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async assignRoleToAgent(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentRoleService.assignRoleToAgent({
      agentId,
      roleId,
      workspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  async removeRoleFromAgent(
    @Args('agentId', { type: () => UUIDScalarType }) agentId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.agentRoleService.removeRoleFromAgent({
      agentId,
      workspaceId,
    });

    return true;
  }

  @ResolveField('workspaceMembers', () => [WorkspaceMemberDTO])
  async getWorkspaceMembersAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    const workspaceMembers =
      await this.userRoleService.getWorkspaceMembersAssignedToRole(
        role.id,
        workspace.id,
      );

    return workspaceMembers;
  }

  @ResolveField('agents', () => [AgentDTO])
  async getAgentsAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentDTO[]> {
    const agents = await this.agentRoleService.getAgentsAssignedToRole(
      role.id,
      workspace.id,
    );

    return agents.map((agent) => ({
      ...agent,
      applicationId: agent.applicationId ?? undefined,
    }));
  }

  @ResolveField('apiKeys', () => [ApiKeyForRoleDTO])
  async getApiKeysAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ApiKeyForRoleDTO[]> {
    const apiKeys = await this.apiKeyRoleService.getApiKeysAssignedToRole(
      role.id,
      workspace.id,
    );

    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      expiresAt: apiKey.expiresAt,
      revokedAt: apiKey.revokedAt,
    }));
  }
}
