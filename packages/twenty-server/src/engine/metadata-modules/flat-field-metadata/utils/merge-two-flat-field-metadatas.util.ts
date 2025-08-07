import {
  deepMerge,
  fromArrayToUniqueKeyRecord,
  isDefined,
} from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { ToMerge } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/to-merge.type';

export const mergeTwoFlatFieldMetadatas = ({
  destFlatFieldMetadatas,
  toMergeFlatFieldMetadatas,
}: ToMerge<FlatFieldMetadata[], 'FlatFieldMetadatas'>): FlatFieldMetadata[] => {
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
        [fieldUniqueIdentifier]: isDefined(destFieldMetadata)
          ? deepMerge(destFieldMetadata, flatFieldToMerge)
          : flatFieldToMerge,
      };
    }, initialRecordAccumulator);

  return Object.values(mergedUniqueIdentifierFlatFieldMetadataRecord);
};
