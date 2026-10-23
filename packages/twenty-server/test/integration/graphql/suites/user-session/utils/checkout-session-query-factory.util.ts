import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';

export type CheckoutSessionFactoryInput = {
  recurringInterval: string;
  plan: BillingPlanKey;
  successUrlPath?: string;
};

export const checkoutSessionQueryFactory = ({
  input,
}: PerformMetadataQueryParams<CheckoutSessionFactoryInput>) => ({
  query: gql`
    mutation CheckoutSession(
      $recurringInterval: SubscriptionInterval!
      $plan: BillingPlanKey!
      $successUrlPath: String
    ) {
      checkoutSession(
        recurringInterval: $recurringInterval
        plan: $plan
        successUrlPath: $successUrlPath
      ) {
        url
      }
    }
  `,
  variables: {
    recurringInterval: input.recurringInterval,
    plan: input.plan,
    successUrlPath: input.successUrlPath,
  },
});
