import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { STRIPE_SDK_MOCK_CUSTOMER_EMAIL } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock-customer-email.constant';

const SEEDED_STRIPE_CUSTOMER_ID = 'cus_default0';
const SEEDED_STRIPE_CUSTOMER_EMAIL = 'tim@apple.dev';

const client = request(`http://localhost:${APP_PORT}`);

const CURRENT_WORKSPACE_STRIPE_CUSTOMER_EMAIL_OPERATION = {
  query: gql`
    query CurrentWorkspaceStripeCustomerEmail {
      currentWorkspace {
        billingCustomer {
          id
          stripeCustomerEmail
        }
      }
    }
  `,
};

const getStripeCustomerEmail = async (token?: string) => {
  const response = await makeMetadataApiRequest(
    CURRENT_WORKSPACE_STRIPE_CUSTOMER_EMAIL_OPERATION,
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentWorkspace.billingCustomer
    .stripeCustomerEmail;
};

describe('billing customer email', () => {
  afterAll(async () => {
    await globalThis.testDataSource.query(
      `UPDATE core."billingCustomer" SET "stripeCustomerEmail" = $1 WHERE "stripeCustomerId" = $2`,
      [SEEDED_STRIPE_CUSTOMER_EMAIL, SEEDED_STRIPE_CUSTOMER_ID],
    );
  });

  it('should expose the Stripe customer email to a member with the billing permission', async () => {
    expect(await getStripeCustomerEmail()).toBe(SEEDED_STRIPE_CUSTOMER_EMAIL);
  });

  it('should hide the Stripe customer email from a member without the billing permission', async () => {
    expect(
      await getStripeCustomerEmail(APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toBeNull();
  });

  it('should store the live Stripe email on customer.updated, not the event payload email', async () => {
    await client
      .post('/webhooks/stripe')
      .set('stripe-signature', 'correct-signature')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          type: 'customer.updated',
          data: {
            object: {
              id: SEEDED_STRIPE_CUSTOMER_ID,
              object: 'customer',
              email: 'outdated@apple.dev',
              metadata: {},
            },
          },
        }),
      )
      .expect(200);

    expect(await getStripeCustomerEmail()).toBe(STRIPE_SDK_MOCK_CUSTOMER_EMAIL);
  });
});
