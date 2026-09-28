import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type UpdateMyApplicationVariableFactoryInput = {
  key: string;
  value: string;
  applicationId?: string;
};

export const updateMyApplicationVariableQueryFactory = ({
  input,
}: PerformMetadataQueryParams<UpdateMyApplicationVariableFactoryInput>) => ({
  query: gql`
    mutation UpdateMyApplicationVariable(
      $key: String!
      $value: String!
      $applicationId: UUID
    ) {
      updateMyApplicationVariable(
        key: $key
        value: $value
        applicationId: $applicationId
      )
    }
  `,
  variables: {
    key: input.key,
    value: input.value,
    applicationId: input.applicationId,
  },
});
