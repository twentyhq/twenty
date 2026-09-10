import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Single assembly of the position-numbering inputs shared by the same-batch
// field path and the created-object path, so reserved-field and caller-field
// selection cannot drift between them.
export const computeViewFieldPositionInputFlatFieldMetadatas = ({
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  applicationUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): {
  systemFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  callerFlatFieldMetadatas: UniversalFlatFieldMetadata[];
} => ({
  systemFlatFieldMetadatas: Object.values(
    buildReservedSystemFlatFieldMetadatasForCustomObject({
      flatObjectMetadata: {
        applicationUniversalIdentifier,
        universalIdentifier: objectMetadataUniversalIdentifier,
      },
    }),
  ),
  callerFlatFieldMetadatas: computeCallerFlatFieldMetadatasForObject({
    objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  }),
});
