import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_MY_APPLICATION_PREFERENCES_GQL_FIELDS = `
  applicationId
  settingsMenuItems {
    id
    universalIdentifier
    applicationId
    frontComponentId
    title
    icon
    position
    scope
  }
  variables {
    key
    value
    isSecret
  }
`;

export const myApplicationPreferencesQueryFactory = ({
  gqlFields = DEFAULT_MY_APPLICATION_PREFERENCES_GQL_FIELDS,
}: PerformMetadataQueryParams<Record<string, never>>) => ({
  query: gql`
    query MyApplicationPreferences {
      myApplicationPreferences {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
