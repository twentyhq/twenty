import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { FieldPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/field-permission.dto';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { fromFlatFieldPermissionToFieldPermissionDto } from 'src/engine/metadata-modules/object-permission/utils/from-flat-field-permission-to-field-permission-dto.util';
import { fromFlatObjectPermissionToObjectPermissionDto } from 'src/engine/metadata-modules/object-permission/utils/from-flat-object-permission-to-object-permission-dto.util';
import { RolePermissionFlagDTO } from 'src/engine/metadata-modules/role-permission-flag/dtos/role-permission-flag.dto';
import { UpsertPermissionFlagsInput } from 'src/engine/metadata-modules/role-permission-flag/dtos/upsert-permission-flags.input';
import { RolePermissionFlagService } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.service';
import { fromFlatRolePermissionFlagToRolePermissionFlagDto } from 'src/engine/metadata-modules/role-permission-flag/utils/from-flat-role-permission-flag-to-role-permission-flag-dto.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';
import {
  ApiKeyForRoleDTO,
  RoleDTO,
} from 'src/engine/metadata-modules/role/dtos/role.dto';
import { UpdateRoleInput } from 'src/engine/metadata-modules/role/dtos/update-role.input';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UpsertRowLevelPermissionPredicatesInput } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/inputs/upsert-row-level-permission-predicates.input';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { UpsertRowLevelPermissionPredicatesResultDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/upsert-row-level-permission-predicates-result.dto';
import { RowLevelPermissionPredicateService } from 'src/engine/metadata-modules/row-level-permission-predicate/services/row-level-permission-predicate.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@MetadataResolver(() => RoleDTO)
@UsePipes(ResolverValidationPipe)
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
  SettingsPermissionGuard(PermissionFlagType.ROLES),
)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
export class RoleResolver {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    private readonly rolePermissionFlagService: RolePermissionFlagService,
    private readonly agentRoleService: AiAgentRoleService,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly applicationService: ApplicationService,
    private readonly rowLevelPermissionPredicateService: RowLevelPermissionPredicateService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => [RoleDTO])
  async getRoles(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RoleDTO[]> {
    return this.roleService.getWorkspaceRoles(workspace.id);
  }

  @Query(() => RoleDTO)
  async getRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType }) id: string,
  ): Promise<RoleDTO> {
    const role = await this.roleService.getRoleById(id, workspace.id);

    if (!isDefined(role)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    return role;
  }

  @Mutation(() => WorkspaceMemberDTO)
  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: { withUser: true, withoutUser: false },
      application: false,
    }),
  )
  async updateWorkspaceMemberRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('workspaceMemberId', { type: () => UUIDScalarType })
    workspaceMemberId: string,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
    @AuthUserWorkspaceId()
    actingUserWorkspaceId: string,
  ): Promise<WorkspaceMemberDTO> {
    const { workspaceMember, userWorkspaceId } =
      await this.userRoleService.assignRoleToWorkspaceMember({
        workspaceId: workspace.id,
        workspaceMemberId,
        roleId,
        actingUserWorkspaceId,
      });

    const roles = await this.userRoleService
      .getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspaceId],
        workspaceId: workspace.id,
      })
      .then(
        (rolesByUserWorkspaces) =>
          rolesByUserWorkspaces?.get(userWorkspaceId) ?? [],
      );

    return {
      ...workspaceMember,
      userWorkspaceId,
      roles,
    } as WorkspaceMemberDTO;
  }

  @Mutation(() => RoleDTO)
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
      application: false,
    }),
  )
  async createOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('createRoleInput') createRoleInput: CreateRoleInput,
  ): Promise<RoleDTO> {
    const { id: workspaceId } = workspace;
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    return await this.roleService.createRole({
      workspaceId,
      input: createRoleInput,
      ownerFlatApplication: workspaceCustomFlatApplication,
    });
  }

  @Mutation(() => RoleDTO)
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
      application: false,
    }),
  )
  async updateOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput,
    @AuthUserWorkspaceId({ allowUndefined: true })
    actingUserWorkspaceId?: string,
  ): Promise<RoleDTO> {
    const role = await this.roleService.updateRole({
      input: updateRoleInput,
      workspaceId: workspace.id,
      actingRoleIds: await this.getActingRoleIds({
        workspaceId: workspace.id,
        actingUserWorkspaceId,
      }),
    });

    return role;
  }

  @Mutation(() => String)
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
      application: false,
    }),
  )
  async deleteOneRole(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('roleId', { type: () => UUIDScalarType }) roleId: string,
    @AuthUserWorkspaceId({ allowUndefined: true })
    actingUserWorkspaceId?: string,
  ): Promise<string> {
    const deletedRole = await this.roleService.deleteRole({
      roleId,
      workspaceId: workspace.id,
      actingRoleIds: await this.getActingRoleIds({
        workspaceId: workspace.id,
        actingUserWorkspaceId,
      }),
    });

    return deletedRole.id;
  }

  // Lockout protection only applies to human actors; API-key callers have no user workspace
  private async getActingRoleIds({
    workspaceId,
    actingUserWorkspaceId,
  }: {
    workspaceId: string;
    actingUserWorkspaceId?: string;
  }): Promise<string[] | undefined> {
    if (!isDefined(actingUserWorkspaceId)) {
      return undefined;
    }

    return resolveRoleIdsForUser({
      userRoleId: await this.userRoleService.getRoleIdForUserWorkspace({
        workspaceId,
        userWorkspaceId: actingUserWorkspaceId,
      }),
      applicationRoleId: undefined,
    });
  }

  @Mutation(() => [ObjectPermissionDTO])
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
      application: false,
    }),
  )
  async upsertObjectPermissions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertObjectPermissionsInput')
    upsertObjectPermissionsInput: UpsertObjectPermissionsInput,
  ): Promise<ObjectPermissionDTO[]> {
    const flatObjectPermissions =
      await this.objectPermissionService.upsertObjectPermissions({
        workspaceId: workspace.id,
        input: upsertObjectPermissionsInput,
      });
    return flatObjectPermissions.map(
      fromFlatObjectPermissionToObjectPermissionDto,
    );
  }

  @Mutation(() => [RolePermissionFlagDTO])
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
      application: false,
    }),
  )
  async upsertPermissionFlags(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertPermissionFlagsInput')
    upsertPermissionFlagsInput: UpsertPermissionFlagsInput,
  ): Promise<RolePermissionFlagDTO[]> {
    const flatRolePermissionFlags =
      await this.rolePermissionFlagService.upsertPermissionFlags({
        workspaceId: workspace.id,
        input: upsertPermissionFlagsInput,
      });
    const { flatPermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: workspace.id,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    return flatRolePermissionFlags.map((flatRolePermissionFlag) =>
      fromFlatRolePermissionFlagToRolePermissionFlagDto(
        flatRolePermissionFlag,
        flatPermissionFlagMaps,
      ),
    );
  }

  @Mutation(() => [FieldPermissionDTO])
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
      application: false,
    }),
  )
  async upsertFieldPermissions(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('upsertFieldPermissionsInput')
    upsertFieldPermissionsInput: UpsertFieldPermissionsInput,
  ): Promise<FieldPermissionDTO[]> {
    const flatFieldPermissions =
      await this.fieldPermissionService.upsertFieldPermissions({
        workspaceId: workspace.id,
        input: upsertFieldPermissionsInput,
      });
    return flatFieldPermissions.map(
      fromFlatFieldPermissionToFieldPermissionDto,
    );
  }

  @Mutation(() => UpsertRowLevelPermissionPredicatesResultDTO)
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
      application: false,
    }),
  )
  async upsertRowLevelPermissionPredicates(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input')
    input: UpsertRowLevelPermissionPredicatesInput,
  ): Promise<UpsertRowLevelPermissionPredicatesResultDTO> {
    return this.rowLevelPermissionPredicateService.upsertRowLevelPermissionPredicates(
      {
        workspaceId: workspace.id,
        input,
      },
    );
  }

  @Mutation(() => Boolean)
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
      application: false,
    }),
  )
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
      application: false,
    }),
  )
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
    @Context() context: { loaders: IDataloaders },
  ): Promise<FlatWorkspaceMember[]> {
    return context.loaders.workspaceMembersByRoleIdLoader.load({
      workspaceId: workspace.id,
      roleId: role.id,
    });
  }

  @ResolveField('agents', () => [AgentDTO])
  async getAgentsAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<AgentDTO[]> {
    return context.loaders.agentsByRoleIdLoader.load({
      workspaceId: workspace.id,
      roleId: role.id,
    });
  }

  @ResolveField('apiKeys', () => [ApiKeyForRoleDTO])
  async getApiKeysAssignedToRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<ApiKeyForRoleDTO[]> {
    return context.loaders.apiKeysByRoleIdLoader.load({
      workspaceId: workspace.id,
      roleId: role.id,
    });
  }

  @ResolveField(
    'rowLevelPermissionPredicates',
    () => [RowLevelPermissionPredicateDTO],
    { nullable: true },
  )
  async getRowLevelPermissionPredicatesForRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RowLevelPermissionPredicateDTO[]> {
    const { rowLevelPermissionPredicates } =
      await context.loaders.rowLevelPermissionsByRoleIdLoader.load({
        workspaceId: workspace.id,
        roleId: role.id,
      });

    return rowLevelPermissionPredicates;
  }

  @ResolveField(
    'rowLevelPermissionPredicateGroups',
    () => [RowLevelPermissionPredicateGroupDTO],
    { nullable: true },
  )
  async getRowLevelPermissionPredicateGroupsForRole(
    @Parent() role: RoleDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    const { rowLevelPermissionPredicateGroups } =
      await context.loaders.rowLevelPermissionsByRoleIdLoader.load({
        workspaceId: workspace.id,
        roleId: role.id,
      });

    return rowLevelPermissionPredicateGroups;
  }
}
