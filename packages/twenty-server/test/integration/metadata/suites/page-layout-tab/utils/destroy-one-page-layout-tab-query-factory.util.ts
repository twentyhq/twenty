import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DestroyOnePageLayoutTabFactoryInput = {
  id: string;
};

export const destroyOnePageLayoutTabQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DestroyOnePageLayoutTabFactoryInput>) => ({
  query: gql`
    mutation DestroyPageLayoutTab($id: String!) {
      destroyPageLayoutTab(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
