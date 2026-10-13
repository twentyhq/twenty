import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const MESSAGE_CAMPAIGN_TABLE = `${WORKSPACE_SCHEMA}."messageCampaign"`;
const CAMPAIGN_DELIVERY_TABLE = `${WORKSPACE_SCHEMA}."campaignDelivery"`;

const CANCEL_MESSAGE_CAMPAIGN = gql`
  mutation CancelMessageCampaign($input: CancelMessageCampaignInput!) {
    cancelMessageCampaign(input: $input) {
      campaignId
      canceledMessageCount
    }
  }
`;

describe('cancelMessageCampaign sentAt (integration)', () => {
  const seededCampaignIds: string[] = [];
  let wasMessageCampaignEnabled: boolean;

  const seedSendingCampaign = async (
    deliveryStates: string[],
  ): Promise<string> => {
    const campaignId = v4();

    await testDataSource.query(
      `INSERT INTO ${MESSAGE_CAMPAIGN_TABLE} ("id", "name", "status")
       VALUES ($1, $2, 'SENDING')`,
      [campaignId, `Cancel sentAt ${campaignId}`],
    );

    seededCampaignIds.push(campaignId);

    for (const state of deliveryStates) {
      const deliveryId = v4();

      await testDataSource.query(
        `INSERT INTO ${CAMPAIGN_DELIVERY_TABLE}
           ("id", "campaignId", "personId", "recipientEmail", "state")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          deliveryId,
          campaignId,
          v4(),
          `cancel-sent-at-${deliveryId}@example.com`,
          state,
        ],
      );
    }

    return campaignId;
  };

  const cancelCampaign = async (campaignId: string) => {
    const response = await makeMetadataApiRequest({
      query: CANCEL_MESSAGE_CAMPAIGN,
      variables: { input: { campaignId } },
    });

    expect(response.body.errors).toBeUndefined();
  };

  const readCampaign = async (
    campaignId: string,
  ): Promise<{ status: string; sentAt: Date | null }> => {
    const [campaign] = await testDataSource.query(
      `SELECT "status", "sentAt" FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = $1`,
      [campaignId],
    );

    return campaign;
  };

  beforeAll(async () => {
    wasMessageCampaignEnabled =
      await getAppProviderByClassName<FeatureFlagService>(
        'FeatureFlagService',
      ).isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
        SEED_APPLE_WORKSPACE_ID,
      );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    if (seededCampaignIds.length > 0) {
      await testDataSource.query(
        `DELETE FROM ${CAMPAIGN_DELIVERY_TABLE} WHERE "campaignId" = ANY($1)`,
        [seededCampaignIds],
      );
      await testDataSource.query(
        `DELETE FROM ${MESSAGE_CAMPAIGN_TABLE} WHERE "id" = ANY($1)`,
        [seededCampaignIds],
      );
    }

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: wasMessageCampaignEnabled,
      expectToFail: false,
    });
  });

  it('records a send date on a canceled campaign that sent at least one email', async () => {
    const campaignId = await seedSendingCampaign(['SENT', 'QUEUED', 'QUEUED']);

    await cancelCampaign(campaignId);

    const campaign = await readCampaign(campaignId);

    expect(campaign.status).toBe('CANCELED');
    expect(campaign.sentAt).not.toBeNull();
  });

  it('leaves the send date empty on a canceled campaign that sent nothing', async () => {
    const campaignId = await seedSendingCampaign(['QUEUED', 'QUEUED']);

    await cancelCampaign(campaignId);

    expect(await readCampaign(campaignId)).toEqual({
      status: 'CANCELED',
      sentAt: null,
    });
  });
});
