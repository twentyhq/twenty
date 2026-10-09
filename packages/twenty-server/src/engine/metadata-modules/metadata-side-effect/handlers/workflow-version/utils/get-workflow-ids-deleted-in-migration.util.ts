import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';

export const getWorkflowIdsDeletedInMigration = ({
  allFlatEntityOperationRecordByMetadataName,
  flatWorkflowMaps,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
} & Pick<AllFlatEntityMaps, 'flatWorkflowMaps'>): Set<string> =>
  new Set(
    Object.keys(
      allFlatEntityOperationRecordByMetadataName.workflow?.flatEntityToDelete ??
        {},
    )
      .map(
        (universalIdentifier) =>
          flatWorkflowMaps.byUniversalIdentifier[universalIdentifier]?.id,
      )
      .filter(isDefined),
  );
