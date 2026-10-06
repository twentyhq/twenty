import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_APPLICATION_VARIABLE_USER_VALUES_GQL_FIELDS = `
  userWorkspaceId
  workspaceMemberId
  variables {
    key
    value
  }
`;

export const applicationVariableUserValuesQueryFactory = ({
  gqlFields = DEFAULT_APPLICATION_VARIABLE_USER_VALUES_GQL_FIELDS,
}: PerformMetadataQueryParams<Record<string, never>>) => ({
  query: gql`
    query ApplicationVariableUserValues {
      applicationVariableUserValues {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
