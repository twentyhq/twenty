import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const performObjectMetadataCreation = async (
  args: Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>,
) => {
  const graphqlOperation = createOneObjectMetadataFactory({
    input: { object: args },
    gqlFields: `
          id
          nameSingular
      `,
  });

  return await makeMetadataAPIRequest(graphqlOperation);
};
