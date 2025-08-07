import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { mergeFlatFieldMetadatasInFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/merge-flat-field-metadatas-in-flat-object-metadata.util';
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
    fromArrayToValuesByKeyRecord({
      array: flatFieldMetadatas,
      key: 'objectMetadataId',
    });

  return flatObjectMetadatas.map((flatObjectMetadata) => {
    const toMergeFlatFieldMetadatas =
      flatFieldMetadataGroupedByFlatObjectMetadataId[flatObjectMetadata.id];

    if (!isDefined(toMergeFlatFieldMetadatas)) {
      return flatObjectMetadata;
    }

    return mergeFlatFieldMetadatasInFlatObjectMetadata({
      flatFieldMetadatas: toMergeFlatFieldMetadatas,
      flatObjectMetadata,
    });
  });
};
