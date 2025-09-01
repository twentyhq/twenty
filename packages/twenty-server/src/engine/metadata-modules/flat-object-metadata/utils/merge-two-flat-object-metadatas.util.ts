import {
  deepMerge,
  fromArrayToUniqueKeyRecord,
  isDefined,
} from 'twenty-shared/utils';

import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ToMerge } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/to-merge.type';

export const mergeTwoFlatObjectMetadatas = ({
  destFlatObjectMetadatas,
  toMergeFlatObjectMetadatas,
}: ToMerge<
  FlatObjectMetadata[],
  'FlatObjectMetadatas'
>): FlatObjectMetadata[] => {
  const initialObjectAccumulator = fromArrayToUniqueKeyRecord({
    array: destFlatObjectMetadatas,
    uniqueKey: 'universalIdentifier',
  });

  const mergedUniversalIdentifierFlatObjectMetadataRecord =
    toMergeFlatObjectMetadatas.reduce<Record<string, FlatObjectMetadata>>(
      (acc, toMergeFlatObjectMetadata) => {
        const flatObjectUniversalIdentifier =
          toMergeFlatObjectMetadata.universalIdentifier;
        const accumulatorCurrentOccurrence: FlatObjectMetadata | undefined =
          initialObjectAccumulator[flatObjectUniversalIdentifier];

        if (!isDefined(accumulatorCurrentOccurrence)) {
          return {
            ...acc,
            [flatObjectUniversalIdentifier]: toMergeFlatObjectMetadata,
          };
        }

        const {
          flatFieldMetadatas: destFlatFieldMetadatas,
          ...destFlatObjectMetadataRest
        } = accumulatorCurrentOccurrence;
        const {
          flatFieldMetadatas: toMergeFlatFieldMetadatas,
          ...toMergeFlatObjectMetadataRest
        } = toMergeFlatObjectMetadata;
        const mergedFlatObjectMetadata: FlatObjectMetadata = {
          ...deepMerge(
            destFlatObjectMetadataRest,
            toMergeFlatObjectMetadataRest,
          ),
          // TODO prastoin handle indexes
          flatFieldMetadatas: mergeTwoFlatFieldMetadatas({
            destFlatFieldMetadatas,
            toMergeFlatFieldMetadatas,
          }),
        };

        return {
          ...acc,
          [flatObjectUniversalIdentifier]: mergedFlatObjectMetadata,
        };
      },
      initialObjectAccumulator,
    );

  return Object.values(mergedUniversalIdentifierFlatObjectMetadataRecord);
};
