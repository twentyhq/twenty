import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteOneAgentFactoryInput = {
  id: string;
};

export const deleteOneAgentQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteOneAgentFactoryInput>) => ({
  query: gql`
    mutation DeleteOneAgent($input: AgentIdInput!) {
      deleteOneAgent(input: $input) {
        id
      }
    }
  `,
  variables: {
    input: {
      id: input.id,
    },
  },
});
