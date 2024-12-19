import { createOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

const FIELD_NAME = 'testName';

export const createTestTextFieldMetadata = async (
  objectMetadataItemId: string,
) => {
  const createFieldInput = {
    name: FIELD_NAME,
    label: 'Test name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: objectMetadataItemId,
    isLabelSyncedWithName: true,
  };
  const graphqlOperation = createOneFieldMetadataFactory({
    input: { field: createFieldInput },
    gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
      `,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  return { fieldMetadataId: response.body.data.createOneField.id };
};
