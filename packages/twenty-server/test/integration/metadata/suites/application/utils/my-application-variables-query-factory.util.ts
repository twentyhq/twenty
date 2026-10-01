import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type MyApplicationVariablesFactoryInput = {
  applicationUniversalIdentifier: string;
};

const DEFAULT_MY_APPLICATION_VARIABLE_GQL_FIELDS = `
  key
  value
`;

export const myApplicationVariablesQueryFactory = ({
  input,
  gqlFields = DEFAULT_MY_APPLICATION_VARIABLE_GQL_FIELDS,
}: PerformMetadataQueryParams<MyApplicationVariablesFactoryInput>) => ({
  query: gql`
    query MyApplicationVariables($applicationUniversalIdentifier: String!) {
      myApplicationVariables(
        applicationUniversalIdentifier: $applicationUniversalIdentifier
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationUniversalIdentifier: input.applicationUniversalIdentifier,
  },
});
