import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteOneFieldMetadataItemFactory } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata-factory.util';

export const deleteFieldMetadata = async (fieldMetadataId: string) => {
  const graphqlOperation = deleteOneFieldMetadataItemFactory({
    idToDelete: fieldMetadataId,
  });

  await makeGraphqlAPIRequest(graphqlOperation);
};
