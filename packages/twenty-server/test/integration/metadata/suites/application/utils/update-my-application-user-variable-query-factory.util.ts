import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateMyApplicationUserVariableFactoryInput = {
  applicationUniversalIdentifier: string;
  key: string;
  value: string;
};

export const updateMyApplicationUserVariableQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateMyApplicationUserVariableFactoryInput>) => ({
  query: gql`
    mutation UpdateMyApplicationUserVariable(
      $applicationUniversalIdentifier: String!
      $key: String!
      $value: String!
    ) {
      updateMyApplicationUserVariable(
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
