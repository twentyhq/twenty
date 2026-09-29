import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type ApplicationVariableUserValuesFactoryInput = {
  key: string;
};

export const applicationVariableUserValuesQueryFactory = ({
  input,
}: PerformMetadataQueryParams<ApplicationVariableUserValuesFactoryInput>) => ({
  query: gql`
    query ApplicationVariableUserValues($key: String!) {
      applicationVariableUserValues(key: $key) {
        userWorkspaceId
        workspaceMemberId
        value
      }
    }
  `,
  variables: {
    key: input.key,
  },
});
