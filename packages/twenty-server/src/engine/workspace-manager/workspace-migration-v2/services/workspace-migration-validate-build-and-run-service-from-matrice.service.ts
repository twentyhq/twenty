import { Injectable, Logger } from '@nestjs/common';
import {
  computeFlatEntityMapsFromTo,
  ComputeFlatEntityMapsFromToArgs,
} from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';
import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

type ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs = {
  workspaceId: string;
  allFlatEntities: {
    [P in AllMetadataName]?: ComputeFlatEntityMapsFromToArgs<P>;
  };
};

// Could rename to api metadata
@Injectable()
export class WorkspaceMigrationValidateBuildAndRunServiceFromMatriceService {
  private readonly logger = new Logger(
    WorkspaceMigrationValidateBuildAndRunServiceFromMatriceService.name,
  );

  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  private prastoin(
    allFlatEntities: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs['allFlatEntities'],
  ): Pick<WorkspaceMigrationOrchestratorBuildArgs, 'fromToAllFlatEntityMaps'> &
    Pick<
      WorkspaceMigrationOrchestratorBuildArgs['buildOptions'],
      'inferDeletionFromMissingEntities'
    > {
    const allObjectMetadataNames = Object.keys(
      allFlatEntities,
    ) as AllMetadataName[];
    const fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'] =
      {};
    const inferDeletionFromMissingEntities: WorkspaceMigrationOrchestratorBuildArgs['buildOptions']['inferDeletionFromMissingEntities'] =
      {};

    for (const metadataName of allObjectMetadataNames) {
      const tmp = allFlatEntities[metadataName];
      if (!isDefined(tmp)) {
        throw new Error('Should never occurs');
      }
      const {
        flatEntityMaps,
        flatEntityToCreate,
        flatEntityToDelete,
        flatEntityToUpdate,
      } = tmp;
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      // @ts-expect-error prastoin investigate
      fromToAllFlatEntityMaps[flatEntityMapsKey] = computeFlatEntityMapsFromTo<
        typeof metadataName
      >({
        flatEntityMaps,
        flatEntityToCreate,
        flatEntityToDelete,
        flatEntityToUpdate,
      });

      if (flatEntityToDelete.length > 0) {
        inferDeletionFromMissingEntities[metadataName] = true;
      }
    }

    return {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
    };
  }

  public async validateBuildAndRunWorkspaceMigrationFromMatrice({
    allFlatEntities,
    workspaceId,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<
    WorkspaceMigrationOrchestratorFailedResult | undefined
  > {
    const { fromToAllFlatEntityMaps, inferDeletionFromMissingEntities } =
      this.prastoin(allFlatEntities);
    return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        fromToAllFlatEntityMaps,
        buildOptions: {
          inferDeletionFromMissingEntities,
          isSystemBuild: false,
        },
        workspaceId,
        // TODO should this be passed by caller ? inferred at runtime ? we could recompute them here though
        dependencyAllFlatEntityMaps: {},
      },
    );
  }
}
