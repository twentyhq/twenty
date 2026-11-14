import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import {
  buildPersonalFlatRole,
  getPersonalRoleUniversalIdentifier,
} from 'src/engine/permissions/channel-visibility/utils/build-personal-flat-role.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class PersonalRoleService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async ensurePersonalRoles({
    workspaceId,
    userWorkspaceIds,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
  }): Promise<Map<string, string>> {
    const { flatRoleMaps, flatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatRoleMaps', 'flatRoleTargetMaps'] },
      );
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const existingFlatRoleTargets = Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const personalRoleIdByUserWorkspaceId = new Map<string, string>();
    const flatRolesToCreate: FlatRole[] = [];
    const flatRoleTargetsToCreate: FlatRoleTarget[] = [];

    for (const userWorkspaceId of userWorkspaceIds) {
      const flatRole =
        findFlatEntityByUniversalIdentifier({
          universalIdentifier:
            getPersonalRoleUniversalIdentifier(userWorkspaceId),
          flatEntityMaps: flatRoleMaps,
        }) ??
        buildPersonalFlatRole({
          workspaceId,
          userWorkspaceId,
          flatApplication: workspaceCustomFlatApplication,
        });

      personalRoleIdByUserWorkspaceId.set(userWorkspaceId, flatRole.id);

      if (!isDefined(flatRoleMaps.universalIdentifierById[flatRole.id])) {
        flatRolesToCreate.push(flatRole);
      }

      const isRoleHeld = existingFlatRoleTargets.some(
        (flatRoleTarget) =>
          flatRoleTarget.userWorkspaceId === userWorkspaceId &&
          flatRoleTarget.roleId === flatRole.id,
      );

      if (!isRoleHeld) {
        const now = new Date().toISOString();

        flatRoleTargetsToCreate.push({
          id: v4(),
          universalIdentifier: v4(),
          roleId: flatRole.id,
          roleUniversalIdentifier: flatRole.universalIdentifier,
          isAdditional: true,
          userWorkspaceId,
          agentId: null,
          agentUniversalIdentifier: null,
          apiKeyId: null,
          webhookId: null,
          webhookUniversalIdentifier: null,
          targetApplicationId: null,
          targetApplicationUniversalIdentifier: null,
          createdAt: now,
          updatedAt: now,
          workspaceId,
          applicationId: workspaceCustomFlatApplication.id,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        });
      }
    }

    if (
      flatRolesToCreate.length === 0 &&
      flatRoleTargetsToCreate.length === 0
    ) {
      return personalRoleIdByUserWorkspaceId;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            role: {
              flatEntityToCreate: flatRolesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: flatRoleTargetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Validation errors occurred while creating personal roles',
      );
    }

    return personalRoleIdByUserWorkspaceId;
  }
}
