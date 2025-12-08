import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export const createOneSelectFieldMetadataForIntegrationTests = async ({
  input,
  expectToFail = false,
}: {
  input: Partial<CreateOneFieldMetadataInput> & {
    objectMetadataId: string;
    options?: FieldMetadataComplexOption[];
    name?: string;
  };
  expectToFail?: boolean;
}) => {
  const {
    data: {
      createOneField: { id: selectFieldMetadataId },
    },
  } = await createOneFieldMetadata({
    expectToFail,
    input: {
      name: 'normalField',
      type: FieldMetadataType.SELECT,
      label: 'Select Field',
      options: [
        { label: 'Option 1', value: 'OPTION_1', color: 'blue', position: 0 },
        { label: 'Option 2', value: 'OPTION_2', color: 'red', position: 1 },
        { label: 'Option 3', value: 'OPTION_3', color: 'green', position: 2 },
      ],
      ...input,
    },
    gqlFields: 'id',
  });

  return { selectFieldMetadataId };
};
