import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DestroyOnePageLayoutFactoryInput = {
  id: string;
};

export const destroyOnePageLayoutQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DestroyOnePageLayoutFactoryInput>) => ({
  query: gql`
    mutation DestroyPageLayout($id: String!) {
      destroyPageLayout(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
