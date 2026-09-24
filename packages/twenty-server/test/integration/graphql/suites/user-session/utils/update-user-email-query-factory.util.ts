import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateUserEmailFactoryInput = {
  newEmail: string;
};

export const updateUserEmailQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateUserEmailFactoryInput>) => ({
  query: gql`
    mutation UpdateUserEmail($newEmail: String!) {
      updateUserEmail(newEmail: $newEmail)
    }
  `,
  variables: { newEmail: input.newEmail },
});
