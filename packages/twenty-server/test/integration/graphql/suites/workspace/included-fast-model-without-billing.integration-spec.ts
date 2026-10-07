import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { gql } from 'graphql-tag';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';

const CURRENT_WORKSPACE_BILLING_ENTITLEMENTS = gql`
  query CurrentWorkspaceBillingEntitlements {
    currentUser {
      currentWorkspace {
        billingEntitlements {
          key
          value
        }
      }
    }
  }
`;

(isBillingEnabled ? describe.skip : describe)(
  'Included fast model without billing',
  () => {
    it('reports the included fast model entitlement as not granted', async () => {
      const response = await makeMetadataApiRequest({
        query: CURRENT_WORKSPACE_BILLING_ENTITLEMENTS,
      });

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.currentUser.currentWorkspace.billingEntitlements,
      ).toContainEqual({
        key: BillingEntitlementKey.INCLUDED_FAST_MODEL,
        value: false,
      });
    });

    it('advertises no included chat model', async () => {
      const response = await request(`http://localhost:${APP_PORT}`)
        .get('/client-config')
        .expect(200);

      expect(response.body.aiIncludedChatModelId).toBeNull();
    });
  },
);
