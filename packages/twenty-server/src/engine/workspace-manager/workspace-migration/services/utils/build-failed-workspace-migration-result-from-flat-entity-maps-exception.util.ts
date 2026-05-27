import { ALL_METADATA_NAME, type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataNameFromFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-name-from-flat-entity-maps-key.util';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import {
  type FromToAllUniversalFlatEntityMaps,
  type WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';

const DEFAULT_METADATA_NAME: AllMetadataName = ALL_METADATA_NAME.objectMetadata;

export const buildFailedWorkspaceMigrationResultFromFlatEntityMapsException = ({
  error,
  fromToAllFlatEntityMaps,
}: {
  error: FlatEntityMapsException;
  fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps;
}): WorkspaceMigrationOrchestratorFailedResult => {
  const firstInvolvedFlatEntityMapsKey = Object.keys(fromToAllFlatEntityMaps)[0];

  const metadataName = isDefined(firstInvolvedFlatEntityMapsKey)
    ? getMetadataNameFromFlatEntityMapsKey(firstInvolvedFlatEntityMapsKey)
    : DEFAULT_METADATA_NAME;

  return {
    status: 'fail',
    report: {
      ...EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
      [metadataName]: [
        {
          type: 'update',
          metadataName,
          errors: [
            {
              code: error.code,
              message: error.message,
              userFriendlyMessage: error.userFriendlyMessage,
            },
          ],
          flatEntityMinimalInformation: {},
        },
      ],
    },
  };
};
