import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type CreateOneViewFactoryInput = {
  icon?: string;
  id: string;
  isCompact?: boolean;
  kanbanFieldMetadataId?: string;
  key?: string;
  name?: string;
  objectMetadataId: string;
  position?: number;
  type: string;
};

export const createOneViewQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneViewFactoryInput>) => ({
  query: gql`
        mutation CreateOneView($input: ViewCreateInput!) {
          createView(data: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input,
  },
});
