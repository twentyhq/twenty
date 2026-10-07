import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type MyAppPreferencesApplicationVariablesInput = {
  applicationUniversalIdentifier: string;
};

export const myAppPreferencesApplicationVariablesQueryFactory = ({
  input,
  gqlFields = 'key value label description type options isSecret isRequired isDeprecated',
}: PerformMetadataQueryParams<MyAppPreferencesApplicationVariablesInput>) => ({
  query: gql`
    query MyAppPreferencesApplicationVariables(
      $applicationUniversalIdentifier: UUID!
    ) {
      myAppPreferencesApplicationVariables(
        applicationUniversalIdentifier: $applicationUniversalIdentifier
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: input,
});
