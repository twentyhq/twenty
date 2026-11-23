import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type SetupOidcSsoInput } from 'src/engine/core-modules/sso/dtos/setup-sso.input';

export type CreateOneOidcIdentityProviderFactoryInput = SetupOidcSsoInput;

const DEFAULT_SSO_IDENTITY_PROVIDER_GQL_FIELDS = `
  id
  type
  issuer
  name
  status
`;

export const createOneOidcIdentityProviderQueryFactory = ({
  input,
  gqlFields = DEFAULT_SSO_IDENTITY_PROVIDER_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneOidcIdentityProviderFactoryInput>) => ({
  query: gql`
        mutation CreateOIDCIdentityProvider($input: SetupOIDCSsoInput!) {
          createOIDCIdentityProvider(input: $input) {
            ${gqlFields}
          }
        }
      `,
  variables: {
    input,
  },
});
