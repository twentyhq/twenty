import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('billingPlans query', () => {
  it('returns the same plans as the deprecated listPlans', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query BillingPlansAndDeprecatedListPlans {
          billingPlans {
            planKey
            isSellable
          }
          listPlans {
            planKey
            isSellable
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.billingPlans).toEqual(
      response.body.data.listPlans,
    );
  });
});
