import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { EmailingOngoingStaleCronJob } from 'src/modules/emailing/crons/jobs/emailing-ongoing-stale.cron.job';

const CAMPAIGN_TABLE_NAME = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."messageCampaign"`;

const TWO_HOURS_AGO = new Date(Date.now() - 2 * 60 * 60 * 1000);

describe('Emailing ongoing-stale cron (integration)', () => {
  const campaignId = v4();
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = getAppProviderByClassName<DataSource>('DataSource');

    await dataSource.query(
      `INSERT INTO ${CAMPAIGN_TABLE_NAME} ("id", "name", "status", "updatedAt")
       VALUES ($1, $2, $3, $4)`,
      [
        campaignId,
        'Stale sending campaign',
        MessageCampaignStatus.SENDING,
        TWO_HOURS_AGO,
      ],
    );
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM ${CAMPAIGN_TABLE_NAME} WHERE "id" = $1`,
      [campaignId],
    );
  });

  it('releases a sending campaign that materialized no message back to draft', async () => {
    const [{ emailingDomainCount }] = await dataSource.query(
      `SELECT count(*)::int AS "emailingDomainCount"
         FROM "core"."emailingDomain" WHERE "workspaceId" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(emailingDomainCount).toBeGreaterThan(0);

    await runSyncCron(EmailingOngoingStaleCronJob);

    const [campaign] = await dataSource.query(
      `SELECT "status" FROM ${CAMPAIGN_TABLE_NAME} WHERE "id" = $1`,
      [campaignId],
    );

    expect(campaign.status).toBe(MessageCampaignStatus.DRAFT);
  });
});
