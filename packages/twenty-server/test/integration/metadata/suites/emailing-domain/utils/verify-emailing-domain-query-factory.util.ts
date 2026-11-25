import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type VerifyEmailingDomainFactoryInput = {
  id: string;
};

const DEFAULT_EMAILING_DOMAIN_GQL_FIELDS = `
  id
  domain
  status
`;

export const verifyEmailingDomainQueryFactory = ({
  input,
  gqlFields = DEFAULT_EMAILING_DOMAIN_GQL_FIELDS,
}: PerformMetadataQueryParams<VerifyEmailingDomainFactoryInput>) => ({
  query: gql`
        mutation VerifyEmailingDomain($id: String!) {
          verifyEmailingDomain(id: $id) {
            ${gqlFields}
          }
        }
      `,
  variables: {
    id: input.id,
  },
});
