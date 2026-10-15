import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { buildMorphRelationHeadSwitchOperations } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-switch-operations.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type OwnedEntity = { applicationUniversalIdentifier: string };

@Injectable()
export class MorphRelationHeadSwitchService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async switchMorphRelationHead({
    workspaceId,
    isMorphRelationHeadEnabled,
  }: {
    workspaceId: string;
    isMorphRelationHeadEnabled: boolean;
  }): Promise<void> {
    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatFieldPermissionMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
      'flatViewSortMaps',
      'flatFieldPermissionMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      viewFieldsToCreate,
      viewFieldsToDelete,
      viewFiltersToUpdate,
      viewSortsToUpdate,
      fieldPermissionsToUpdate,
      pageLayoutWidgetsToUpdate,
    } = buildMorphRelationHeadSwitchOperations({
      isMorphRelationHeadEnabled,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatFieldPermissionMaps,
      flatPageLayoutWidgetMaps,
    });

    const applicationUniversalIdentifiers = new Set(
      [
        ...viewFieldsToCreate,
        ...viewFieldsToDelete,
        ...viewFiltersToUpdate,
        ...viewSortsToUpdate,
        ...fieldPermissionsToUpdate,
        ...pageLayoutWidgetsToUpdate,
      ].map(
        ({ applicationUniversalIdentifier }) => applicationUniversalIdentifier,
      ),
    );

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const ownedBy = <TEntity extends OwnedEntity>(entities: TEntity[]) =>
        entities.filter(
          (entity) =>
            entity.applicationUniversalIdentifier ===
            applicationUniversalIdentifier,
        );

      const args = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: ownedBy(viewFieldsToCreate),
            flatEntityToUpdate: [],
            flatEntityToDelete: ownedBy(viewFieldsToDelete),
          },
          viewFilter: {
            flatEntityToCreate: [],
            flatEntityToUpdate: ownedBy(viewFiltersToUpdate),
            flatEntityToDelete: [],
          },
          viewSort: {
            flatEntityToCreate: [],
            flatEntityToUpdate: ownedBy(viewSortsToUpdate),
            flatEntityToDelete: [],
          },
          fieldPermission: {
            flatEntityToCreate: [],
            flatEntityToUpdate: ownedBy(fieldPermissionsToUpdate),
            flatEntityToDelete: [],
          },
          pageLayoutWidget: {
            flatEntityToCreate: [],
            flatEntityToUpdate: ownedBy(pageLayoutWidgetsToUpdate),
            flatEntityToDelete: [],
          },
        } satisfies AllFlatEntityOperationByMetadataName,
      };

      const result =
        applicationUniversalIdentifier ===
        twentyStandardFlatApplication.universalIdentifier
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              args,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              args,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to move morph relation references of application ${applicationUniversalIdentifier}`,
        );
      }
    }

    await this.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId,
      featureFlag: FeatureFlagKey.IS_MORPH_RELATION_HEAD_ENABLED,
      value: isMorphRelationHeadEnabled,
    });
  }
}
