import { Injectable } from '@nestjs/common';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getSubFlatEntityMapsByApplicationIdOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-id-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-all-metadata-name.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import { FromToAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

@Injectable()
export class TwentyStandardApplicationService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async synchronizeTwentyStandardApplication({
    workspaceId,
  }: {
    workspaceId: string;
  }) {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const fromTwentyStandardAllFlatEntityMaps =
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        TWENTY_STANDARD_ALL_METADATA_NAME.map(getMetadataFlatEntityMapsKey),
      );
    const toTwentyStandardAllFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fromToAllFlatEntityMaps: FromToAllFlatEntityMaps = {};
    for (const metadataName of TWENTY_STANDARD_ALL_METADATA_NAME) {
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const fromFlatEntityMaps =
        fromTwentyStandardAllFlatEntityMaps[flatEntityMapsKey];
      const fromTo = {
        from: getSubFlatEntityMapsByApplicationIdOrThrow<
          MetadataFlatEntity<typeof metadataName>
        >({
          applicationId: twentyStandardFlatApplication.id,
          flatEntityMaps: fromFlatEntityMaps,
        }),
        to: toTwentyStandardAllFlatEntityMaps[flatEntityMapsKey],
      };

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] = fromTo;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
        },
      );

    if (validateAndBuildResult?.status === 'fail') {
      throw new Error(
        `[SEED] Twenty standard app installation failed for workspace ${workspaceId}`,
      );
    }
  }
}
