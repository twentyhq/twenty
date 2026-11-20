import IORedis from 'ioredis';
import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { INVITATION_SENDING_BY_SENDER_THROTTLE } from 'src/engine/core-modules/workspace-invitation/constants/invitation-sending-by-sender-throttle.constant';
import { buildInvitationSendingThrottleKey } from 'src/engine/core-modules/workspace-invitation/utils/build-invitation-sending-throttle-key.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const SENDER_WORK_DOMAIN = 'apple.dev';
const OUTSIDE_DOMAIN = 'example.com';
const RATE_LIMITED_MESSAGE =
  'Too many workspace invitations sent. Please try again later.';

const THROTTLE_KEY_PREFIX = `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}`;

const runId = Date.now();
let inviteeCount = 0;

const buildInviteeEmails = (count: number, domain: string) =>
  Array.from(
    { length: count },
    () => `rate-limit-${runId}-${inviteeCount++}@${domain}`,
  );

const sendInvitations = async (emails: string[]) => {
  const response = await makeMetadataApiRequest(
    sendInvitationsOperationFactory({ emails }),
  );

  return {
    success: response.body.data?.sendInvitations?.success,
    errorMessage: response.body.errors?.[0]?.extensions?.userFriendlyMessage,
  };
};

const resetInvitationThrottles = async () => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const senderAndInviteeKeys = await Promise.all(
      [USER_DATA_SEED_IDS.JANE, `rate-limit-${runId}-`].map((keyStart) =>
        redis.keys(
          `${THROTTLE_KEY_PREFIX}:${buildInvitationSendingThrottleKey(keyStart)}*`,
        ),
      ),
    );

    await redis.del(
      ...senderAndInviteeKeys.flat(),
      `${THROTTLE_KEY_PREFIX}:${buildInvitationSendingThrottleKey(SEED_APPLE_WORKSPACE_ID)}`,
    );
  } finally {
    redis.disconnect();
  }
};

const deleteSentInvitations = () =>
  testDataSource.query(
    `DELETE FROM core."appToken" WHERE "workspaceId" = $1 AND context->>'email' LIKE $2`,
    [SEED_APPLE_WORKSPACE_ID, `rate-limit-${runId}-%`],
  );

const mockInstance = ({ isBillingEnabled }: { isBillingEnabled: boolean }) => {
  mockConfigVariables({ IS_BILLING_ENABLED: isBillingEnabled });

  jest
    .spyOn(
      getAppProviderByClassName<EnterprisePlanService>('EnterprisePlanService'),
      'isValid',
    )
    .mockReturnValue(true);
};

describe('Workspace invitation sending rate limit (integration)', () => {
  beforeEach(resetInvitationThrottles);

  afterEach(async () => {
    jest.restoreAllMocks();
    await deleteSentInvitations();
    await resetInvitationThrottles();
  });

  describe('on Twenty Cloud', () => {
    beforeEach(() => mockInstance({ isBillingEnabled: true }));

    it('caps invitations to other domains per sender', async () => {
      const allowance = await sendInvitations(
        buildInviteeEmails(
          INVITATION_SENDING_BY_SENDER_THROTTLE.limit,
          OUTSIDE_DOMAIN,
        ),
      );

      const overflow = await sendInvitations(
        buildInviteeEmails(1, OUTSIDE_DOMAIN),
      );

      expect(allowance.success).toBe(true);
      expect(overflow.errorMessage).toBe(RATE_LIMITED_MESSAGE);
    });

    it('gives a work email a larger allowance for colleagues on its own domain', async () => {
      const allowance = await sendInvitations(
        buildInviteeEmails(
          INVITATION_SENDING_BY_SENDER_THROTTLE.sameWorkDomainLimit,
          SENDER_WORK_DOMAIN,
        ),
      );

      const overflow = await sendInvitations(
        buildInviteeEmails(1, SENDER_WORK_DOMAIN),
      );

      expect(allowance.success).toBe(true);
      expect(overflow.errorMessage).toBe(RATE_LIMITED_MESSAGE);
    });
  });

  describe('on a self-hosted enterprise instance', () => {
    beforeEach(() => mockInstance({ isBillingEnabled: false }));

    it('skips the per-sender daily cap', async () => {
      const { success } = await sendInvitations(
        buildInviteeEmails(
          INVITATION_SENDING_BY_SENDER_THROTTLE.limit + 1,
          OUTSIDE_DOMAIN,
        ),
      );

      expect(success).toBe(true);
    });

    it('still caps repeated invitations to the same person', async () => {
      const [inviteeEmail] = buildInviteeEmails(1, OUTSIDE_DOMAIN);
      const perInviteeLimit = getAppProviderByClassName<TwentyConfigService>(
        'TwentyConfigService',
      ).get('INVITATION_SENDING_BY_EMAIL_THROTTLE_LIMIT');

      for (let attempt = 0; attempt < perInviteeLimit; attempt++) {
        await sendInvitations([inviteeEmail]);
      }

      const overflow = await sendInvitations([inviteeEmail]);

      expect(overflow.errorMessage).toBe(RATE_LIMITED_MESSAGE);
    });
  });
});
