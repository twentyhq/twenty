import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';

import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type BuildSearchVectorFlatFieldMetadataForCustomObjectArgs = {
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'applicationUniversalIdentifier'
  >;
};

export const buildSearchVectorFlatFieldMetadataForCustomObject = ({
  flatObjectMetadata: {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
  },
}: BuildSearchVectorFlatFieldMetadataForCustomObjectArgs): UniversalFlatFieldMetadata<FieldMetadataType.TS_VECTOR> => {
  const now = new Date().toISOString();

  const { searchVector } = PARTIAL_SYSTEM_FLAT_FIELD_METADATAS;

  return {
    ...searchVector,
    universalIdentifier: getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      name: searchVector.name,
    }),
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
    universalSettings: null,
  };
};
