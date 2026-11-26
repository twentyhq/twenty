import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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

const sendCustomerUpdatedEvent = ({
  email,
  previousAttributes,
}: {
  email: string;
  previousAttributes: Record<string, unknown>;
}) =>
  client
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
            email,
            metadata: {},
          },
          previous_attributes: previousAttributes,
        },
      }),
    )
    .expect(200);

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

  it('should ignore a customer.updated event that does not change the email', async () => {
    await sendCustomerUpdatedEvent({
      email: 'unrelated@apple.dev',
      previousAttributes: { metadata: {} },
    });

    expect(await getStripeCustomerEmail()).toBe(SEEDED_STRIPE_CUSTOMER_EMAIL);
  });

  it('should store the new email from a customer.updated event that changes it', async () => {
    await sendCustomerUpdatedEvent({
      email: 'finance@apple.dev',
      previousAttributes: { email: SEEDED_STRIPE_CUSTOMER_EMAIL },
    });

    expect(await getStripeCustomerEmail()).toBe('finance@apple.dev');
  });
});
