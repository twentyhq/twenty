import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RotateApplicationRegistrationClientSecretFactoryInput = {
  id: string;
};

export const rotateApplicationRegistrationClientSecretQueryFactory = ({
  input,
}: PerformMetadataQueryParams<RotateApplicationRegistrationClientSecretFactoryInput>) => ({
  query: gql`
    mutation RotateApplicationRegistrationClientSecret($id: String!) {
      rotateApplicationRegistrationClientSecret(id: $id) {
        clientSecret
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
