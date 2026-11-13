import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { transpileFlatEntityOperationArrayToRecord } from 'src/engine/metadata-modules/flat-entity/utils/transpile-flat-entity-operation-array-to-record.util';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';

// A caller that only declares field operations, such as an upgrade command written before option rows
// or an app sync that left the options unchanged, still gets the option rows its fields imply.
export const addMissingFieldMetadataOptionOperationsToOperationRecord = ({
  allFlatEntityOperationRecordByMetadataName,
  existingFlatFieldMetadataOptionMaps,
  applicationUniversalIdentifier,
}: {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  existingFlatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps;
  applicationUniversalIdentifier: string;
}): AllFlatEntityOperationRecordByMetadataName => {
  const fieldMetadataOperationRecord =
    allFlatEntityOperationRecordByMetadataName.fieldMetadata;

  if (
    !isDefined(fieldMetadataOperationRecord) ||
    isDefined(allFlatEntityOperationRecordByMetadataName.fieldMetadataOption)
  ) {
    return allFlatEntityOperationRecordByMetadataName;
  }

  const fieldMetadataOptionOperations =
    computeFieldMetadataOptionOperationsForFieldMetadatas({
      flatFieldMetadatasToCreate: Object.values(
        fieldMetadataOperationRecord.flatEntityToCreate,
      ).filter(isDefined),
      flatFieldMetadatasToUpdate: Object.values(
        fieldMetadataOperationRecord.flatEntityToUpdate,
      ).filter(isDefined),
      flatFieldMetadatasToDelete: Object.values(
        fieldMetadataOperationRecord.flatEntityToDelete,
      ).filter(isDefined),
      existingFlatFieldMetadataOptionMaps,
      applicationUniversalIdentifier,
      shouldLeaveOtherApplicationOptions: true,
    });

  const hasNoOptionOperation = Object.values(
    fieldMetadataOptionOperations,
  ).every((flatFieldMetadataOptions) => flatFieldMetadataOptions.length === 0);

  if (hasNoOptionOperation) {
    return allFlatEntityOperationRecordByMetadataName;
  }

  return {
    ...allFlatEntityOperationRecordByMetadataName,
    ...transpileFlatEntityOperationArrayToRecord({
      fieldMetadataOption: fieldMetadataOptionOperations,
    }),
  };
};
