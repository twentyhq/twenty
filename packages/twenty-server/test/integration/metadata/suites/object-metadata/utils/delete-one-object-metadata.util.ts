import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-factory.util';

export const deleteOneObjectMetadataItem = async (
  objectMetadataItemId: string,
) => {
  const graphqlOperation = deleteOneObjectMetadataItemFactory({
    idToDelete: objectMetadataItemId,
  });

  await makeGraphqlAPIRequest(graphqlOperation);
};
