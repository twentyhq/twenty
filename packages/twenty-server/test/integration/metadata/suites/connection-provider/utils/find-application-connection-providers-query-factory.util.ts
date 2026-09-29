import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationConnectionProvidersFactoryInput = {
  applicationId: string;
};

const DEFAULT_FIND_APPLICATION_CONNECTION_PROVIDERS_GQL_FIELDS = `
  id
  name
  applicationId
`;

export const findApplicationConnectionProvidersQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_APPLICATION_CONNECTION_PROVIDERS_GQL_FIELDS,
}: PerformMetadataQueryParams<FindApplicationConnectionProvidersFactoryInput>) => ({
  query: gql`
    query ApplicationConnectionProviders($applicationId: UUID!) {
      applicationConnectionProviders(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});
