import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOnePageLayoutTabFactoryInput = {
  id: string;
};

export const deleteOnePageLayoutTabQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    mutation DeletePageLayoutTab($id: String!) {
      deletePageLayoutTab(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
