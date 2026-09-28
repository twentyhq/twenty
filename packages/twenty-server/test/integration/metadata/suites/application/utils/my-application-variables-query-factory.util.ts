import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type MyApplicationVariablesFactoryInput = {
  applicationId?: string;
};

export const myApplicationVariablesQueryFactory = ({
  input,
}: PerformMetadataQueryParams<MyApplicationVariablesFactoryInput>) => ({
  query: gql`
    query MyApplicationVariables($applicationId: UUID) {
      myApplicationVariables(applicationId: $applicationId) {
        key
        value
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});
