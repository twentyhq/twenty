import { fromArrayToKeyRecordArray, isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { mergeTwoFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-two-flat-field-metadatas.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type DispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatasArgs = {
  flatObjectMetadatas: FlatObjectMetadata[];
  flatFieldMetadatas: FlatFieldMetadata[];
};
export const dispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatas = ({
  flatFieldMetadatas,
  flatObjectMetadatas,
}: DispatchAndMergeFlatFieldMetadatasInFlatObjectMetadatasArgs): FlatObjectMetadata[] => {
  if (flatFieldMetadatas.length === 0) {
    return flatObjectMetadatas;
  }

  const flatFieldMetadataGroupedByFlatObjectMetadataId =
    fromArrayToKeyRecordArray({
      array: flatFieldMetadatas,
      key: 'objectMetadataId',
    });

  return flatObjectMetadatas.map((flatObjectMetadata) => {
    const toMergeFlatFieldMetadatas =
      flatFieldMetadataGroupedByFlatObjectMetadataId[flatObjectMetadata.id];

    if (!isDefined(toMergeFlatFieldMetadatas)) {
      return flatObjectMetadata;
    }

    return {
      ...flatObjectMetadata,
      flatFieldMetadatas: mergeTwoFlatFieldMetadatas({
        destFlatFieldMetadatas: flatObjectMetadata.flatFieldMetadatas,
        toMergeFlatFieldMetadatas,
      }),
    };
  });
};
