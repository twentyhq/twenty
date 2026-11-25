import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateEmailingDomainInput } from 'src/engine/core-modules/emailing-domain/dtos/create-emailing-domain.input';

const DEFAULT_EMAILING_DOMAIN_GQL_FIELDS = `
  id
  domain
  status
`;

export const createEmailingDomainQueryFactory = ({
  input,
  gqlFields = DEFAULT_EMAILING_DOMAIN_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateEmailingDomainInput>) => ({
  query: gql`
        mutation CreateEmailingDomain($input: CreateEmailingDomainInput!) {
          createEmailingDomain(input: $input) {
            ${gqlFields}
          }
        }
      `,
  variables: {
    input,
  },
});
