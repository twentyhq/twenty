import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  GetMockObjectMetadataEntityOverride,
  getMockObjectdMetadataEntity,
} from 'src/utils/__test__/get-object-metadata-entity.mock';

type GetMockObjectMetadataItemWithFielsMapsOverride =
  GetMockObjectMetadataEntityOverride &
    Required<
      Pick<
        ObjectMetadataItemWithFieldMaps,
        | 'fieldsById'
        | 'fieldIdByJoinColumnName'
        | 'fieldIdByName'
        | 'indexMetadatas'
      >
    >;

export const getMockObjectMetadataItemWithFielsMaps = ({
  fieldsById,
  fieldIdByJoinColumnName,
  fieldIdByName,
  indexMetadatas,
  ...objectMetadataOverrides
}: GetMockObjectMetadataItemWithFielsMapsOverride): ObjectMetadataItemWithFieldMaps => {
  const { fields: _fields, ...objectMetadata } = getMockObjectdMetadataEntity(
    objectMetadataOverrides,
  );

  return {
    ...objectMetadata,
    fieldsById,
    fieldIdByJoinColumnName,
    fieldIdByName,
    indexMetadatas,
  };
};
