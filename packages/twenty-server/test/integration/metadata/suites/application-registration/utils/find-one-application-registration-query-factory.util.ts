import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOneApplicationRegistrationFactoryInput = {
  id: string;
};

const DEFAULT_FIND_ONE_APPLICATION_REGISTRATION_GQL_FIELDS = `
  id
  universalIdentifier
`;

export const findOneApplicationRegistrationQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_ONE_APPLICATION_REGISTRATION_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOneApplicationRegistrationFactoryInput>) => ({
  query: gql`
    query FindOneApplicationRegistration($id: String!) {
      findOneApplicationRegistration(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
