import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type RevokeApplicationAuthorizationFactoryInput = {
  applicationAuthorizationId: string;
};

export const revokeApplicationAuthorizationQueryFactory = ({
  input,
}: PerformMetadataQueryParams<RevokeApplicationAuthorizationFactoryInput>) => ({
  query: gql`
    mutation RevokeApplicationAuthorization(
      $applicationAuthorizationId: UUID!
    ) {
      revokeApplicationAuthorization(
        applicationAuthorizationId: $applicationAuthorizationId
      )
    }
  `,
  variables: {
    applicationAuthorizationId: input.applicationAuthorizationId,
  },
});
