import { FlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-field-metadata';
import { fromArrayToUniqueKeyRecord } from 'src/engine/workspace-manager/workspace-migration-v2/utils/from-array-to-unique-key-record.util';
import { ToMerge } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/to-merge.type';
import { deepMerge } from 'twenty-shared/utils';

export const mergeTwoFlatFieldMetadatas = ({
  destFlatFieldMetadatas,
  toMergeFlatFieldMetadatas,
}: ToMerge<FlatFieldMetadata[], 'field'>): FlatFieldMetadata[] => {
  const initialRecordAccumulator = fromArrayToUniqueKeyRecord({
    array: destFlatFieldMetadatas,
    uniqueKey: 'uniqueIdentifier',
  });

  const mergedUniqueIdentifierFlatFieldMetadataRecord =
    toMergeFlatFieldMetadatas.reduce((acc, flatFieldToMerge) => {
      const fieldUniqueIdentifier = flatFieldToMerge.uniqueIdentifier;
      const destFieldMetadata: FlatFieldMetadata | undefined =
        acc[fieldUniqueIdentifier];

      return {
        ...acc,
        [fieldUniqueIdentifier]: deepMerge(destFieldMetadata, flatFieldToMerge),
      };
    }, initialRecordAccumulator);

  return Object.values(mergedUniqueIdentifierFlatFieldMetadataRecord);
};
