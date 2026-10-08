import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type MyAppPreferencesSettingsMenuItemsInput = {
  applicationUniversalIdentifier: string;
};

export const myAppPreferencesSettingsMenuItemsQueryFactory = ({
  input,
  gqlFields = 'id universalIdentifier title icon position frontComponentId',
}: PerformMetadataQueryParams<MyAppPreferencesSettingsMenuItemsInput>) => ({
  query: gql`
    query MyAppPreferencesSettingsMenuItems($applicationUniversalIdentifier: UUID!) {
      myAppPreferencesSettingsMenuItems(
        applicationUniversalIdentifier: $applicationUniversalIdentifier
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: input,
});
