import { createOneFieldMetadataFactory } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared';

const FIELD_NAME = 'testName';

export const createCustomTextFieldMetadata = async (
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
