import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateApplicationFactoryInput = {
  id: string;
  autoUpgrade: boolean;
};

const DEFAULT_UPDATE_APPLICATION_GQL_FIELDS = `
  id
`;

export const updateApplicationQueryFactory = ({
  input,
  gqlFields = DEFAULT_UPDATE_APPLICATION_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateApplicationFactoryInput>) => ({
  query: gql`
    mutation UpdateApplication($id: UUID!, $input: UpdateApplicationInput!) {
      updateApplication(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
    input: { autoUpgrade: input.autoUpgrade },
  },
});
