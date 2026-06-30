import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

// TODO prastoin refactor
export const resolveParentFlatObjectMetadataForFieldSideEffect = ({
  objectMetadataUniversalIdentifier,
  allFlatEntityOperationByMetadataName,
  context,
}: {
  objectMetadataUniversalIdentifier: string;
  allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  context: MetadataSideEffectContext;
}): UniversalFlatObjectMetadata | undefined => {
  const existingFlatObjectMetadata =
    context.existingAllFlatEntityMaps?.flatObjectMetadataMaps
      ?.byUniversalIdentifier[objectMetadataUniversalIdentifier];

  if (isDefined(existingFlatObjectMetadata)) {
    return existingFlatObjectMetadata;
  }

  // The object only lives in the matrix (not yet in the workspace cache) when it is created
  // in the same batch as the field — a small per-migration set the matrix doesn't index.
  return (
    allFlatEntityOperationByMetadataName.objectMetadata?.flatEntityToCreate ??
    []
  ).find(
    (flatObjectMetadata) =>
      flatObjectMetadata.universalIdentifier ===
      objectMetadataUniversalIdentifier,
  );
};
