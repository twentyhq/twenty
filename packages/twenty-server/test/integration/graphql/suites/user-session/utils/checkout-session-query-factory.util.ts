import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type CheckoutSessionFactoryInput = {
  recurringInterval: string;
  successUrlPath?: string;
};

export const checkoutSessionQueryFactory = ({
  input,
}: PerformMetadataQueryParams<CheckoutSessionFactoryInput>) => ({
  query: gql`
    mutation CheckoutSession(
      $recurringInterval: SubscriptionInterval!
      $successUrlPath: String
    ) {
      checkoutSession(
        recurringInterval: $recurringInterval
        successUrlPath: $successUrlPath
      ) {
        url
      }
    }
  `,
  variables: {
    recurringInterval: input.recurringInterval,
    successUrlPath: input.successUrlPath,
  },
});
