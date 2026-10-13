import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 } from 'uuid';

import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';

describe('campaign test send variable validation (integration)', () => {
  const domain = `${v4()}.example.com`;

  beforeAll(async () => {
    await testDataSource.query(
      `INSERT INTO "core"."emailingDomain"
         ("workspaceId", "domain", "status", "verifiedAt", "unsubscribeHostname", "unsubscribeHostnameStatus")
       VALUES ($1, $2, 'VERIFIED', now(), $3, 'ACTIVE')`,
      [SEED_APPLE_WORKSPACE_ID, domain, `unsubscribe.${domain}`],
    );
  });

  afterAll(async () => {
    await testDataSource.query(
      `DELETE FROM "core"."emailingDomain" WHERE "domain" = $1`,
      [domain],
    );
  });

  it('refuses a test send that uses a variable the workspace does not have', async () => {
    const messageCampaignService =
      getAppProviderByClassName<MessageCampaignService>(
        'MessageCampaignService',
      );

    await expect(
      messageCampaignService.sendTest({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        toAddress: 'test-send-recipient@example.com',
        subject: 'Test send',
        html: '<p>Hello {{notAPersonField}}</p>',
        fromAddress: `campaigns@${domain}`,
      }),
    ).rejects.toMatchObject({
      code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_UNKNOWN_VARIABLES,
      message: expect.stringContaining('notAPersonField'),
    });
  });
});
