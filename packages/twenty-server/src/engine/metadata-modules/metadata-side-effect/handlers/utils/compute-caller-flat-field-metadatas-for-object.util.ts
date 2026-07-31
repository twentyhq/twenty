import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Every caller-provided field gets an INDEX view field, relations included:
// reserved names (id, deletedAt, …) and system-only types (TS_VECTOR,
// POSITION) are rejected upstream by the flat field validators, so no
// displayability filtering applies to caller fields.
export const computeCallerFlatFieldMetadatasForObject = ({
  objectMetadataUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  objectMetadataUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): UniversalFlatFieldMetadata[] =>
  orderFlatFieldMetadatasForSystemIndexView({
    labelIdentifierFieldMetadataUniversalIdentifier,
    flatFieldMetadatas: (
      Object.values(
        allFlatEntityOperationRecordByMetadataName.fieldMetadata
          ?.flatEntityToCreate ?? {},
      ) as UniversalFlatFieldMetadata[]
    ).filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
          objectMetadataUniversalIdentifier &&
        !flatFieldMetadata.isSystemSideEffect,
    ),
  });
