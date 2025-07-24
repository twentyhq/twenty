import {
  deepMerge,
  fromArrayToUniqueKeyRecord,
  isDefined,
} from 'twenty-shared/utils';

import { FlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-object-metadata';
import { mergeTwoFlatFieldMetadatas } from 'src/engine/workspace-manager/workspace-migration-v2/utils/merge-two-flat-field-metadatas.util';
import { ToMerge } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/to-merge.type';

export const mergeTwoFlatFieldObjectMetadatas = ({
  destFlatObjectMetadatas,
  toMergeFlatObjectMetadatas,
}: ToMerge<FlatObjectMetadata[], 'object'>): FlatObjectMetadata[] => {
  const initialObjectAccumaltor = fromArrayToUniqueKeyRecord({
    array: destFlatObjectMetadatas,
    uniqueKey: 'uniqueIdentifier',
  });

  const mergedUniqueIdentifierFlatObjectMetadataRecord =
    toMergeFlatObjectMetadatas.reduce<Record<string, FlatObjectMetadata>>(
      (acc, toMergeflatObjectMetadata) => {
        const flatObjectUniqueIdentifier =
          toMergeflatObjectMetadata.uniqueIdentifier;
        const accumulatorCurrentOccurence: FlatObjectMetadata | undefined =
          initialObjectAccumaltor[flatObjectUniqueIdentifier];

        if (!isDefined(accumulatorCurrentOccurence)) {
          return {
            ...acc,
            [flatObjectUniqueIdentifier]: toMergeflatObjectMetadata,
          };
        }

        const {
          flatFieldMetadatas: destFlatFieldMetadatas,
          ...destFlatObjectMetadataRest
        } = accumulatorCurrentOccurence;
        const {
          flatFieldMetadatas: toMergeFlatFieldMetadatas,
          ...toMergeFlatObjectMetadataRest
        } = toMergeflatObjectMetadata;
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
          [flatObjectUniqueIdentifier]: mergedFlatObjectMetadata,
        };
      },
      initialObjectAccumaltor,
    );

  return Object.values(mergedUniqueIdentifierFlatObjectMetadataRecord);
};
