import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateMyUserApplicationVariableFactoryInput = {
  applicationUniversalIdentifier: string;
  key: string;
  value: string;
};

export const updateMyUserApplicationVariableQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateMyUserApplicationVariableFactoryInput>) => ({
  query: gql`
    mutation UpdateMyUserApplicationVariable(
      $applicationUniversalIdentifier: String!
      $key: String!
      $value: String!
    ) {
      updateMyUserApplicationVariable(
        applicationUniversalIdentifier: $applicationUniversalIdentifier
        key: $key
        value: $value
      )
    }
  `,
  variables: {
    applicationUniversalIdentifier: input.applicationUniversalIdentifier,
    key: input.key,
    value: input.value,
  },
});
