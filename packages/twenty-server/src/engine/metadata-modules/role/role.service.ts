import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { fromCreateRoleInputToFlatRoleToCreate } from 'src/engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util';
import { fromDeleteRoleInputToFlatRoleOrThrow } from 'src/engine/metadata-modules/flat-role/utils/from-delete-role-input-to-flat-role-or-throw.util';
import { fromUpdateRoleInputToFlatRoleToUpdateOrThrow } from 'src/engine/metadata-modules/flat-role/utils/from-update-role-input-to-flat-role-to-update-or-throw.util';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CreateRoleInput } from 'src/engine/metadata-modules/role/dtos/create-role-input.dto';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { type UpdateRoleInput } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromFlatRoleToRoleDto } from 'src/engine/metadata-modules/role/utils/fromFlatRoleToRoleDto.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RoleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
  ) {}

  public async getWorkspaceRoles(workspaceId: string): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: {
        roleTargets: true,
        permissionFlags: true,
        objectPermissions: true,
        fieldPermissions: true,
      },
    });
  }

  public async getRoleById(
    id: string,
    workspaceId: string,
  ): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({
      where: {
        id,
        workspaceId,
      },
      relations: {
        roleTargets: true,
        permissionFlags: true,
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
    applicationId,
  }: {
    input: CreateRoleInput;
    workspaceId: string;
    applicationId: string;
  }): Promise<RoleDTO> {
    const flatRoleToCreate = fromCreateRoleInputToFlatRoleToCreate({
      createRoleInput: input,
      workspaceId,
      applicationId,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
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
  }: {
    input: UpdateRoleInput;
    workspaceId: string;
  }): Promise<RoleDTO> {
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
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
  }: {
    roleId: string;
    workspaceId: string;
  }): Promise<RoleDTO> {
    const deletedRoles = await this.deleteManyRoles({
      ids: [roleId],
      workspaceId,
      isSystemBuild: false,
    });

    const [deletedRole] = deletedRoles;

    return deletedRole;
  }

  public async deleteManyRoles({
    ids,
    workspaceId,
    isSystemBuild = false,
  }: {
    ids: string[];
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<RoleDTO[]> {
    if (ids.length === 0) {
      return [];
    }

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

      await this.assignDefaultRoleToMembersWithRoleToDelete({
        roleId,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        `Multiple validation errors occurred while deleting role${ids.length > 1 ? 's' : ''}`,
      );
    }

    return rolesToDelete.map(fromFlatRoleToRoleDto);
  }

  public async createMemberRole({
    workspaceId,
    applicationId,
  }: {
    applicationId: string;
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
      applicationId,
      workspaceId,
    });
  }

  public async createGuestRole({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
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
      applicationId,
    });
  }

  // TODO: Move to migration side effect / To address for rollback of role deletion
  private async assignDefaultRoleToMembersWithRoleToDelete({
    roleId,
    workspaceId,
    defaultRoleId,
  }: {
    roleId: string;
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
  }
}
