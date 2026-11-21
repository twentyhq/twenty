import { Injectable } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceMemberIndividualRole } from 'src/engine/permissions/workspace-member-individual-role/types/workspace-member-individual-role.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import {
  buildWorkspaceMemberIndividualRolesFromToFlatEntityMaps,
  WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES,
} from 'src/engine/permissions/workspace-member-individual-role/utils/build-workspace-member-individual-roles-from-to-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DEPENDENCY_FLAT_ENTITY_MAPS_KEYS = [
  ...new Set(
    WORKSPACE_MEMBER_INDIVIDUAL_ROLE_METADATA_NAMES.flatMap((metadataName) => [
      metadataName,
      ...getMetadataRelatedMetadataNamesForValidation(metadataName),
    ]),
  ),
].map(getMetadataFlatEntityMapsKey);

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
        ...DEPENDENCY_FLAT_ENTITY_MAPS_KEYS,
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
