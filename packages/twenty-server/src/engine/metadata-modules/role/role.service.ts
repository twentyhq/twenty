import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromCreateRoleInputToFlatRoleToCreate } from 'src/engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util';
import { fromDeleteRoleInputToFlatRoleOrThrow } from 'src/engine/metadata-modules/flat-role/utils/from-delete-role-input-to-flat-role-or-throw.util';
import { fromUpdateRoleInputToFlatRoleToUpdateOrThrow } from 'src/engine/metadata-modules/flat-role/utils/from-update-role-input-to-flat-role-to-update-or-throw.util';
import { fromFlatFieldPermissionToFieldPermissionDto } from 'src/engine/metadata-modules/object-permission/utils/from-flat-field-permission-to-field-permission-dto.util';
import { fromFlatObjectPermissionToObjectPermissionDto } from 'src/engine/metadata-modules/object-permission/utils/from-flat-object-permission-to-object-permission-dto.util';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role.input';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type UpdateRoleInput } from 'src/engine/metadata-modules/role/dtos/update-role.input';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromFlatRoleToRoleDto } from 'src/engine/metadata-modules/role/utils/fromFlatRoleToRoleDto.util';
import { fromFlatRolePermissionFlagToRolePermissionFlagDto } from 'src/engine/metadata-modules/role-permission-flag/utils/from-flat-role-permission-flag-to-role-permission-flag-dto.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RoleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly applicationService: ApplicationService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly aiAgentRoleService: AiAgentRoleService,
  ) {}

  public async getWorkspaceRoles(workspaceId: string): Promise<RoleDTO[]> {
    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    return this.findManyWithRelationsFromCache(
      Object.values(flatRoleMaps.byUniversalIdentifier).filter(isDefined),
      workspaceId,
    );
  }

  private async findManyWithRelationsFromCache(
    flatRoles: FlatRole[],
    workspaceId: string,
  ): Promise<RoleDTO[]> {
    const {
      flatRolePermissionFlagMaps,
      flatPermissionFlagMaps,
      flatObjectPermissionMaps,
      flatFieldPermissionMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRolePermissionFlagMaps',
            'flatPermissionFlagMaps',
            'flatObjectPermissionMaps',
            'flatFieldPermissionMaps',
          ],
        },
      );

    return flatRoles.map((flatRole) => {
      const roleDto = fromFlatRoleToRoleDto(flatRole);

      roleDto.permissionFlags = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatRole.rolePermissionFlagIds,
        flatEntityMaps: flatRolePermissionFlagMaps,
      }).map((flatRolePermissionFlag) =>
        fromFlatRolePermissionFlagToRolePermissionFlagDto(
          flatRolePermissionFlag,
          flatPermissionFlagMaps,
        ),
      );

      roleDto.objectPermissions = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatRole.objectPermissionIds,
        flatEntityMaps: flatObjectPermissionMaps,
      }).map(fromFlatObjectPermissionToObjectPermissionDto);

      roleDto.fieldPermissions = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatRole.fieldPermissionIds,
        flatEntityMaps: flatFieldPermissionMaps,
      }).map(fromFlatFieldPermissionToFieldPermissionDto);

      return roleDto;
    });
  }

  public async getRoleById(
    id: string,
    workspaceId: string,
  ): Promise<RoleEntity | null> {
    return this.roleRepository.findOne(workspaceId, {
      where: {
        id,
      },
      relations: {
        roleTargets: true,
        rolePermissionFlags: {
          permissionFlag: true,
        },
        objectPermissions: true,
        fieldPermissions: true,
      },
    });
  }

  public async getRoleByUniversalIdentifier({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<RoleDTO | null> {
    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    const flatRoleEntity = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatRoleMaps,
      universalIdentifier,
    });

    return isDefined(flatRoleEntity)
      ? fromFlatRoleToRoleDto(flatRoleEntity)
      : null;
  }

  public async createRole({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: CreateRoleInput;
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<RoleDTO> {
    const flatRoleToCreate = fromCreateRoleInputToFlatRoleToCreate({
      createRoleInput: input,
      workspaceId,
      flatApplication: ownerFlatApplication,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [flatRoleToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            ownerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating role',
      );
    }

    const { flatRoleMaps: recomputedFlatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    return fromFlatRoleToRoleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatRoleToCreate.id,
        flatEntityMaps: recomputedFlatRoleMaps,
      }),
    );
  }

  public async updateRole({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: UpdateRoleInput;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<RoleDTO> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatRoleMaps: existingFlatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    const flatRoleToUpdate = fromUpdateRoleInputToFlatRoleToUpdateOrThrow({
      flatRoleMaps: existingFlatRoleMaps,
      updateRoleInput: input,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatRoleToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating role',
      );
    }

    const { flatRoleMaps: recomputedFlatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    return fromFlatRoleToRoleDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatRoleMaps,
      }),
    );
  }

  public async deleteRole({
    roleId,
    workspaceId,
    ownerFlatApplication,
  }: {
    roleId: string;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<RoleDTO> {
    const deletedRoles = await this.deleteManyRoles({
      ids: [roleId],
      workspaceId,
      isSystemBuild: false,
      ownerFlatApplication,
    });

    const [deletedRole] = deletedRoles;

    return deletedRole;
  }

  public async deleteManyRoles({
    ids,
    workspaceId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    ids: string[];
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<RoleDTO[]> {
    if (ids.length === 0) {
      return [];
    }

    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    const defaultRoleId = workspace?.defaultRoleId;

    if (!isDefined(defaultRoleId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
        {
          userFriendlyMessage: msg`The default role for this workspace could not be found. Please contact support for assistance.`,
        },
      );
    }

    const rolesToDelete = [];

    for (const roleId of ids) {
      const flatRoleToDelete = fromDeleteRoleInputToFlatRoleOrThrow({
        flatRoleMaps,
        roleId,
      });

      if (defaultRoleId === roleId) {
        throw new PermissionsException(
          PermissionsExceptionMessage.DEFAULT_ROLE_CANNOT_BE_DELETED,
          PermissionsExceptionCode.DEFAULT_ROLE_CANNOT_BE_DELETED,
          {
            userFriendlyMessage: msg`The default role cannot be deleted as it is required for the workspace to function properly.`,
          },
        );
      }

      await this.rebindTargetsOfRoleToDeleteToDefaultRole({
        roleId,
        roleLabel: flatRoleToDelete.label,
        workspaceId,
        defaultRoleId,
      });

      rolesToDelete.push(flatRoleToDelete);
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: [],
              flatEntityToDelete: rolesToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while deleting role${ids.length > 1 ? 's' : ''}`,
      );
    }

    return rolesToDelete.map(fromFlatRoleToRoleDto);
  }

  public async createMemberRole({
    workspaceId,
    ownerFlatApplication,
  }: {
    ownerFlatApplication: FlatApplication;
    workspaceId: string;
  }): Promise<RoleDTO> {
    return this.createRole({
      input: {
        label: MEMBER_ROLE_LABEL,
        description: 'Member role',
        icon: 'IconUser',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
      ownerFlatApplication,
      workspaceId,
    });
  }

  public async createGuestRole({
    workspaceId,
    ownerFlatApplication,
  }: {
    workspaceId: string;
    ownerFlatApplication: FlatApplication;
  }): Promise<RoleDTO> {
    return this.createRole({
      input: {
        label: 'Guest',
        description: 'Guest role',
        icon: 'IconUser',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
      workspaceId,
      ownerFlatApplication,
    });
  }

  // TODO: Move to migration side effect / To address for rollback of role deletion
  private async rebindTargetsOfRoleToDeleteToDefaultRole({
    roleId,
    roleLabel,
    workspaceId,
    defaultRoleId,
  }: {
    roleId: string;
    roleLabel: string;
    workspaceId: string;
    defaultRoleId: string;
  }): Promise<void> {
    const userWorkspaceIds =
      await this.userRoleService.getUserWorkspaceIdsAssignedToRole(
        roleId,
        workspaceId,
      );

    await this.userRoleService.assignRoleToManyUserWorkspace({
      userWorkspaceIds,
      roleId: defaultRoleId,
      workspaceId,
    });

    const apiKeysToRebind =
      await this.apiKeyRoleService.getApiKeysAssignedToRole(
        roleId,
        workspaceId,
      );

    for (const apiKey of apiKeysToRebind) {
      try {
        await this.apiKeyRoleService.assignRoleToApiKey({
          apiKeyId: apiKey.id,
          roleId: defaultRoleId,
          workspaceId,
        });
      } catch (error) {
        if (
          error instanceof ApiKeyException &&
          error.code === ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS
        ) {
          throw this.toRoleDeleteRebindException({
            roleLabel,
            targetKind: 'apiKey',
          });
        }
        throw error;
      }
    }

    const agentsToRebind =
      await this.aiAgentRoleService.getAgentsAssignedToRole(
        roleId,
        workspaceId,
      );

    for (const agent of agentsToRebind) {
      try {
        await this.aiAgentRoleService.assignRoleToAgent({
          agentId: agent.id,
          roleId: defaultRoleId,
          workspaceId,
        });
      } catch (error) {
        if (
          error instanceof AiException &&
          error.code === AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS
        ) {
          throw this.toRoleDeleteRebindException({
            roleLabel,
            targetKind: 'agent',
          });
        }
        throw error;
      }
    }
  }

  private toRoleDeleteRebindException({
    roleLabel,
    targetKind,
  }: {
    roleLabel: string;
    targetKind: 'apiKey' | 'agent';
  }): Error {
    const targetLabel = targetKind === 'apiKey' ? 'API key' : 'agent';

    return new PermissionsException(
      `Cannot delete role "${roleLabel}": the workspace default role cannot be assigned to ${targetLabel}s.`,
      targetKind === 'apiKey'
        ? PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS
        : PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
      {
        userFriendlyMessage:
          targetKind === 'apiKey'
            ? msg`Cannot delete this role: it is still assigned to one or more API keys, and the workspace default role cannot be assigned to API keys. Please reassign these API keys to another role first.`
            : msg`Cannot delete this role: it is still assigned to one or more agents, and the workspace default role cannot be assigned to agents. Please reassign these agents to another role first.`,
      },
    );
  }
}
