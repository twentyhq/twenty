import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type SetupSamlSsoInput } from 'src/engine/core-modules/sso/dtos/setup-sso.input';

export type CreateOneSamlIdentityProviderFactoryInput = SetupSamlSsoInput;

const DEFAULT_SSO_IDENTITY_PROVIDER_GQL_FIELDS = `
  id
  type
  issuer
  name
  status
`;

export const createOneSamlIdentityProviderQueryFactory = ({
  input,
  gqlFields = DEFAULT_SSO_IDENTITY_PROVIDER_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneSamlIdentityProviderFactoryInput>) => ({
  query: gql`
        mutation CreateSAMLIdentityProvider($input: SetupSAMLSsoInput!) {
          createSAMLIdentityProvider(input: $input) {
            ${gqlFields}
          }
        }
      `,
  variables: {
    input,
  },
});
