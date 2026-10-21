import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteApplicationRegistrationFactoryInput = {
  id: string;
};

export const deleteApplicationRegistrationQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteApplicationRegistrationFactoryInput>) => ({
  query: gql`
    mutation DeleteApplicationRegistration($id: String!) {
      deleteApplicationRegistration(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
