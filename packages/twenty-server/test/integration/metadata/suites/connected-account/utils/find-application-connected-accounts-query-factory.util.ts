import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindApplicationConnectedAccountsFactoryInput = {
  applicationId: string;
};

const DEFAULT_FIND_APPLICATION_CONNECTED_ACCOUNTS_GQL_FIELDS = `
  id
`;

export const findApplicationConnectedAccountsQueryFactory = ({
  input,
  gqlFields = DEFAULT_FIND_APPLICATION_CONNECTED_ACCOUNTS_GQL_FIELDS,
}: PerformMetadataQueryParams<FindApplicationConnectedAccountsFactoryInput>) => ({
  query: gql`
    query ApplicationConnectedAccounts($applicationId: UUID!) {
      applicationConnectedAccounts(applicationId: $applicationId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    applicationId: input.applicationId,
  },
});
