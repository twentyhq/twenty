import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { buildMorphRelationHeadSwitchOperations } from 'src/engine/metadata-modules/morph-relation-head/utils/build-morph-relation-head-switch-operations.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type OwnedEntity = { applicationUniversalIdentifier: string };

@Injectable()
export class MorphRelationHeadSwitchService {
  private readonly logger = new Logger(MorphRelationHeadSwitchService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly cacheLockService: CacheLockService,
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
    await this.cacheLockService.withLock(async () => {
      try {
        await this.moveReferences({
          workspaceId,
          isMorphRelationHeadEnabled,
        });

        await this.featureFlagService.upsertWorkspaceFeatureFlag({
          workspaceId,
          featureFlag: FeatureFlagKey.IS_MORPH_RELATION_HEAD_ENABLED,
          value: isMorphRelationHeadEnabled,
        });
      } catch (error) {
        await this.moveReferences({
          workspaceId,
          isMorphRelationHeadEnabled: !isMorphRelationHeadEnabled,
        }).catch((restoreError) =>
          this.logger.error(
            `Could not restore morph relation references of workspace ${workspaceId}: ${restoreError}`,
          ),
        );

        throw error;
      }
    }, `morph-relation-head-switch:${workspaceId}`);
  }

  private async moveReferences({
    workspaceId,
    isMorphRelationHeadEnabled,
  }: {
    workspaceId: string;
    isMorphRelationHeadEnabled: boolean;
  }): Promise<void> {
    const {
      flatFieldMetadataMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatFieldPermissionMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
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
      morphIdsWithoutHead,
      viewFieldsToCreate,
      viewFieldsToUpdate,
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
      flatViewFieldGroupMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatFieldPermissionMaps,
      flatPageLayoutWidgetMaps,
    });

    if (isMorphRelationHeadEnabled && morphIdsWithoutHead.length > 0) {
      throw new FieldMetadataException(
        `Morph relations without a head: ${morphIdsWithoutHead.join(', ')}. Run the morph relation head backfill first.`,
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    const applicationUniversalIdentifiers = new Set(
      [
        ...viewFieldsToCreate,
        ...viewFieldsToUpdate,
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
            flatEntityToUpdate: ownedBy(viewFieldsToUpdate),
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
  }
}
