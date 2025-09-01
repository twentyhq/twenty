import {
  deepMerge,
  fromArrayToUniqueKeyRecord,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ToMerge } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/to-merge.type';

export const mergeTwoFlatFieldMetadatas = ({
  destFlatFieldMetadatas,
  toMergeFlatFieldMetadatas,
}: ToMerge<FlatFieldMetadata[], 'FlatFieldMetadatas'>): FlatFieldMetadata[] => {
  const initialRecordAccumulator = fromArrayToUniqueKeyRecord({
    array: destFlatFieldMetadatas,
    uniqueKey: 'universalIdentifier',
  });

  const mergedUniversalIdentifierFlatFieldMetadataRecord =
    toMergeFlatFieldMetadatas.reduce((acc, flatFieldToMerge) => {
      const fieldUniversalIdentifier = flatFieldToMerge.universalIdentifier;
      const destFieldMetadata: FlatFieldMetadata | undefined =
        acc[fieldUniversalIdentifier];

      return {
        ...acc,
        [fieldUniversalIdentifier]: isDefined(destFieldMetadata)
          ? deepMerge(destFieldMetadata, flatFieldToMerge)
          : flatFieldToMerge,
      };
    }, initialRecordAccumulator);

  return Object.values(mergedUniversalIdentifierFlatFieldMetadataRecord);
};
