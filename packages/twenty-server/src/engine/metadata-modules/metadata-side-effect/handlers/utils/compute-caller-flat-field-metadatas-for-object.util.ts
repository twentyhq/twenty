import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Caller-created fields of an object, label identifier first then matrix
// insertion order. Both the object and the field create handlers derive
// view-field positions from this same list (the field handler indexes into it,
// the object handler offsets its system view fields by its length), so the
// resulting INDEX view positions are contiguous without any handler-ordering
// dependency: caller inputs are in the matrix before any handler runs, and
// peer-handler emissions cannot skew the result since everything the engine
// owns is flagged isSystemSideEffect and filtered out here.
export const computeCallerFlatFieldMetadatasForObject = ({
  objectMetadataUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
  displayableOnly,
}: {
  objectMetadataUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  displayableOnly: boolean;
}): UniversalFlatFieldMetadata[] =>
  (
    Object.values(
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToCreate ?? {},
    ) as UniversalFlatFieldMetadata[]
  )
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
          objectMetadataUniversalIdentifier &&
        !flatFieldMetadata.isSystemSideEffect &&
        (!displayableOnly ||
          isFlatFieldMetadataDisplayableInDefaultView({
            flatFieldMetadata,
            labelIdentifierFieldMetadataUniversalIdentifier,
          })),
    )
    .sort((a, b) => {
      const aIsLabelIdentifierFieldMetadata =
        a.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier;
      const bIsLabelIdentifierFieldMetadata =
        b.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier;

      if (aIsLabelIdentifierFieldMetadata && !bIsLabelIdentifierFieldMetadata)
        return -1;
      if (!aIsLabelIdentifierFieldMetadata && bIsLabelIdentifierFieldMetadata)
        return 1;

      return 0;
    });
