import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const findManyObjectsMetadataItems = async () => {
  const query = {
    query: gql`
      query ObjectMetadataItems {
        objects(paging: { first: 1000 }) {
          edges {
            node {
              id
              nameSingular
              namePlural
            }
          }
        }
      }
    `,
  };

  const response = await makeMetadataAPIRequest(query);

  return response.body.data.objects.edges.map((edge) => edge.node) as {
    id: string;
    nameSingular: string;
    namePlural: string;
  }[];
};
