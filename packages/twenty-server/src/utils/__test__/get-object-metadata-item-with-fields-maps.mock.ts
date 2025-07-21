import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import {
  GetMockObjectMetadataEntityOverride,
  getMockObjectMetadataEntity,
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

export const getMockObjectMetadataItemWithFieldsMaps = ({
  fieldsById,
  fieldIdByJoinColumnName,
  fieldIdByName,
  indexMetadatas,
  ...objectMetadataOverrides
}: GetMockObjectMetadataItemWithFielsMapsOverride): ObjectMetadataItemWithFieldMaps => {
  const { fields: _fields, ...objectMetadata } = getMockObjectMetadataEntity(
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
