import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteTwoFactorAuthenticationMethodFactoryInput = {
  twoFactorAuthenticationMethodId: string;
};

export const deleteTwoFactorAuthenticationMethodQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteTwoFactorAuthenticationMethodFactoryInput>) => ({
  query: gql`
    mutation DeleteTwoFactorAuthenticationMethod(
      $twoFactorAuthenticationMethodId: UUID!
    ) {
      deleteTwoFactorAuthenticationMethod(
        twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
      ) {
        success
      }
    }
  `,
  variables: {
    twoFactorAuthenticationMethodId: input.twoFactorAuthenticationMethodId,
  },
});
