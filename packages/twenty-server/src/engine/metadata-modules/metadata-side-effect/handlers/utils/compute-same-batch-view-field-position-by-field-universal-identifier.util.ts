import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import {
  computeDefaultViewFieldPositionByFieldUniversalIdentifier,
  type ViewFieldLabelIdentifierPolicy,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-view-field-position-by-field-universal-identifier.util';
import { computeViewFieldPositionInputFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-view-field-position-input-flat-field-metadatas.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type ParentFlatObjectMetadataForViewFields = {
  applicationUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
};

export const computeSameBatchViewFieldPositionByFieldUniversalIdentifier = ({
  sourceFlatFieldMetadata,
  parentFlatObjectMetadata,
  allFlatEntityOperationRecordByMetadataName,
  labelIdentifierPolicy,
}: {
  sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
  parentFlatObjectMetadata: ParentFlatObjectMetadataForViewFields;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  labelIdentifierPolicy: ViewFieldLabelIdentifierPolicy;
}): Map<string, number> => {
  const { labelIdentifierFieldMetadataUniversalIdentifier } =
    parentFlatObjectMetadata;

  const { systemFlatFieldMetadatas, callerFlatFieldMetadatas } =
    computeViewFieldPositionInputFlatFieldMetadatas({
      applicationUniversalIdentifier:
        parentFlatObjectMetadata.applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

  return computeDefaultViewFieldPositionByFieldUniversalIdentifier({
    systemFlatFieldMetadatas,
    callerFlatFieldMetadatas,
    labelIdentifierFieldMetadataUniversalIdentifier,
    labelIdentifierPolicy,
  });
};
