import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateMyApplicationVariableFactoryInput = {
  applicationUniversalIdentifier: string;
  key: string;
  value: string;
};

export const updateMyApplicationVariableQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateMyApplicationVariableFactoryInput>) => ({
  query: gql`
    mutation UpdateMyApplicationVariable(
      $applicationUniversalIdentifier: String!
      $key: String!
      $value: String!
    ) {
      updateMyApplicationVariable(
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
