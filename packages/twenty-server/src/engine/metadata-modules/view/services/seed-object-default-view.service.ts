import { Injectable, Logger } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import {
  type SeedOperations,
  computeSeedObjectDefaultViewOperations,
} from 'src/engine/metadata-modules/view/utils/compute-seed-object-default-view-operations.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class SeedObjectDefaultViewService {
  private readonly logger = new Logger(SeedObjectDefaultViewService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async computeMissingSeedOperations({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<{
    seedOperations: SeedOperations;
    applicationUniversalIdentifier: string;
    totalCreateCount: number;
  }> {
    const { flatObjectMetadataMaps, flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const seedOperations = computeSeedObjectDefaultViewOperations({
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      seededViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });

    return {
      seedOperations,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      totalCreateCount:
        seedOperations.viewsToCreate.length +
        seedOperations.viewFieldsToCreate.length,
    };
  }

  async seedMissingObjectDefaultViews({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<number> {
    const { seedOperations, applicationUniversalIdentifier, totalCreateCount } =
      await this.computeMissingSeedOperations({ workspaceId });

    if (totalCreateCount === 0) {
      return 0;
    }

    await this.runSeedMigrations({
      workspaceId,
      seedOperations,
      applicationUniversalIdentifier,
    });

    return totalCreateCount;
  }

  private async runSeedMigrations({
    workspaceId,
    seedOperations,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    seedOperations: SeedOperations;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    if (seedOperations.viewsToCreate.length > 0) {
      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          view: {
            flatEntityToCreate: seedOperations.viewsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }

    if (seedOperations.viewFieldsToCreate.length > 0) {
      await this.runSeedMigration({
        workspaceId,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          viewField: {
            flatEntityToCreate: seedOperations.viewFieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
      });
    }
  }

  private async runSeedMigration({
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityOperationByMetadataName,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to seed default view(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to seed default view(s) for workspace ${workspaceId}`,
      );
    }
  }
}
