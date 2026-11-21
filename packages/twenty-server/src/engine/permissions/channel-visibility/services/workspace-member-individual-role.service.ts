import { Injectable } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceMemberIndividualRole } from 'src/engine/permissions/channel-visibility/types/workspace-member-individual-role.type';
import { WORKSPACE_MEMBER_INDIVIDUAL_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS } from 'src/engine/permissions/channel-visibility/constants/workspace-member-individual-role-dependency-flat-entity-maps-keys.constant';
import { buildWorkspaceMemberIndividualRolesFromToFlatEntityMaps } from 'src/engine/permissions/channel-visibility/utils/build-workspace-member-individual-roles-from-to-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class WorkspaceMemberIndividualRoleService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async syncIndividualRoles({
    workspaceId,
    individualRoles,
  }: {
    workspaceId: string;
    individualRoles: WorkspaceMemberIndividualRole[];
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { featureFlagsMap, billingEntitlements, ...flatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...WORKSPACE_MEMBER_INDIVIDUAL_ROLE_DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
        'featureFlagsMap',
        'billingEntitlements',
      ]);

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          workspaceId,
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps:
            buildWorkspaceMemberIndividualRolesFromToFlatEntityMaps({
              individualRoles,
              flatEntityMaps,
              workspaceCustomApplicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              now: new Date().toISOString(),
            }),
          // The builder mutates these maps, so it must not get the cache's own
          dependencyAllFlatEntityMaps: structuredClone(flatEntityMaps),
          additionalCacheDataMaps: { featureFlagsMap, billingEntitlements },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while syncing workspace member individual roles',
      );
    }
  }
}
