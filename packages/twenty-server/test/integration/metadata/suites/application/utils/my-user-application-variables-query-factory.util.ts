import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_MY_USER_APPLICATION_VARIABLES_GQL_FIELDS = `
  userWorkspaceId
  workspaceMemberId
  variables {
    key
    value
  }
`;

export const myUserApplicationVariablesQueryFactory = ({
  gqlFields = DEFAULT_MY_USER_APPLICATION_VARIABLES_GQL_FIELDS,
}: PerformMetadataQueryParams<Record<string, never>>) => ({
  query: gql`
    query MyUserApplicationVariables {
      myUserApplicationVariables {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
