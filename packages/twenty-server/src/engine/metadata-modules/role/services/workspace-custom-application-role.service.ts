import { Injectable } from '@nestjs/common';

import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { buildWorkspaceAdminFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-admin-flat-role.util';
import { buildWorkspaceCustomApplicationGrantedFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-granted-flat-role.util';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { MEMBER_ROLE_LABEL } from 'src/engine/permissions/role/constants/member-role-label.constants';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class WorkspaceCustomApplicationRoleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly roleService: RoleService,
  ) {}

  public async findOrCreateGrantedRoleOrThrow({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<string> {
    const grantedRoleId = await this.findOrCreateFlatRoleOrThrow({
      workspaceId,
      flatRoleToCreate: buildWorkspaceCustomApplicationGrantedFlatRole({
        workspaceId,
        workspaceCustomFlatApplication,
      }),
    });

    if (workspaceCustomFlatApplication.requestedRoleId !== grantedRoleId) {
      await this.applicationService.update(workspaceCustomFlatApplication.id, {
        workspaceId,
        requestedRoleId: grantedRoleId,
      });
    }

    return grantedRoleId;
  }

  public async findOrCreateAdminRoleOrThrow({
    workspaceId,
    workspaceCustomFlatApplication,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
  }): Promise<string> {
    return this.findOrCreateFlatRoleOrThrow({
      workspaceId,
      flatRoleToCreate: buildWorkspaceAdminFlatRole({
        workspaceId,
        ownerFlatApplication: workspaceCustomFlatApplication,
      }),
    });
  }

  public async createMemberRoleOrThrow({
    workspaceId,
    workspaceCustomFlatApplication,
    label = MEMBER_ROLE_LABEL,
  }: {
    workspaceId: string;
    workspaceCustomFlatApplication: FlatApplication;
    label?: string;
  }): Promise<RoleDTO> {
    return this.roleService.createRole({
      input: {
        universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
        label,
        description: 'Member role',
        icon: 'IconUser',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canAccessAllAgentChatChannels: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
      ownerFlatApplication: workspaceCustomFlatApplication,
      workspaceId,
    });
  }

  // Workspace activation is retried after a failure, so the role may already exist
  private async findOrCreateFlatRoleOrThrow({
    workspaceId,
    flatRoleToCreate,
  }: {
    workspaceId: string;
    flatRoleToCreate: FlatRole;
  }): Promise<string> {
    const { flatRoleMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleMaps'],
        },
      );

    const existingFlatRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRoleToCreate.universalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (isDefined(existingFlatRole)) {
      return existingFlatRole.id;
    }

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
          isSystemBuild: true,
          applicationUniversalIdentifier:
            flatRoleToCreate.applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        `Multiple validation errors occurred while creating the ${flatRoleToCreate.label} role`,
      );
    }

    return flatRoleToCreate.id;
  }
}
