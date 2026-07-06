import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type GenericFlatEntityMaps = {
  byUniversalIdentifier: Record<string, unknown>;
};

// A create side effect must noop for an entity that already exists either in the
// pending operation matrix (e.g. a legacy manifest still declaring the default
// field) or in the workspace from-state (e.g. a manifest redeploy). Deterministic
// universal identifiers make this deduplication exact.
export const isFlatEntityAlreadyPresentForSideEffect = ({
  metadataName,
  universalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
}: {
  metadataName: AllMetadataName;
  universalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: Partial<Record<string, GenericFlatEntityMaps>>;
}): boolean => {
  const pendingCreate = (
    allFlatEntityOperationRecordByMetadataName as unknown as Record<
      string,
      { flatEntityToCreate?: Record<string, unknown> } | undefined
    >
  )[metadataName]?.flatEntityToCreate?.[universalIdentifier];

  if (isDefined(pendingCreate)) {
    return true;
  }

  const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
  const existingInWorkspace = (
    relatedFlatEntityMaps as Partial<Record<string, GenericFlatEntityMaps>>
  )[flatEntityMapsKey]?.byUniversalIdentifier?.[universalIdentifier];

  return isDefined(existingInWorkspace);
};
