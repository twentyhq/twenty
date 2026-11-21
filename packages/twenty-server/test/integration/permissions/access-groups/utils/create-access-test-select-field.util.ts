import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const createAccessTestSelectField = async ({
  objectMetadataId,
  name,
  values,
  type = FieldMetadataType.SELECT,
}: {
  objectMetadataId: string;
  name: string;
  values: string[];
  type?: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
}): Promise<string> => {
  const { data } = await createOneFieldMetadata({
    expectToFail: false,
    input: {
      objectMetadataId,
      name,
      label: name,
      type,
      isNullable: true,
      options: values.map((value, position) => ({
        label: value,
        value,
        color: 'blue',
        position,
      })),
    },
    gqlFields: 'id',
  });

  return data.createOneField.id;
};
