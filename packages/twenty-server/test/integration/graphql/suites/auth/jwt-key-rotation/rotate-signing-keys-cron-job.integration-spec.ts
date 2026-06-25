/* @license Enterprise */
/**
 * @queue-driver: bullmq
 */

import { isNonEmptyString } from '@sniptt/guards';
import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { RotateSigningKeysCronJob } from 'src/engine/core-modules/jwt/crons/jobs/rotate-signing-keys.cron.job';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';

const SIGNING_KEY_ROTATION_DAYS_KEY = 'SIGNING_KEY_ROTATION_DAYS';

describe('RotateSigningKeysCronJob (integration)', () => {
  const seededApiKeyId = API_KEY_DATA_SEED_IDS.ID_1;
  let cronQueue: MessageQueueService;

  beforeAll(() => {
    cronQueue = global.app.get<MessageQueueService>(
      getQueueToken(MessageQueue.cronQueue),
    );
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: SIGNING_KEY_ROTATION_DAYS_KEY },
    }).catch(() => {});
  });

  it('rotates the current JWT signing key when the cron command runs and keeps verifying tokens signed by the previous key', async () => {
    const initialTokenResponse = await generateApiKeyToken({
      apiKeyId: seededApiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(initialTokenResponse.body.errors).toBeUndefined();

    const initialApiKeyToken: string =
      initialTokenResponse.body.data?.generateApiKeyToken.token ?? '';

    expect(isNonEmptyString(initialApiKeyToken)).toBe(true);

    const initialKid = decodeJwtCompleteOrThrow(initialApiKeyToken).header
      .kid as string;

    expect(isNonEmptyString(initialKid)).toBe(true);

    const initialAuthCall = await findManyApplications({
      accessToken: initialApiKeyToken,
      expectToFail: false,
    });

    expect(initialAuthCall.errors).toBeUndefined();
    expect(initialAuthCall.data?.findManyApplications).toBeDefined();

    await updateConfigVariable({
      input: { key: SIGNING_KEY_ROTATION_DAYS_KEY, value: 0 },
    });

    await cronQueue.addAndWaitForCompletion(RotateSigningKeysCronJob.name, {});

    const rotatedTokenResponse = await generateApiKeyToken({
      apiKeyId: seededApiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(rotatedTokenResponse.body.errors).toBeUndefined();

    const rotatedApiKeyToken: string =
      rotatedTokenResponse.body.data?.generateApiKeyToken.token ?? '';

    expect(isNonEmptyString(rotatedApiKeyToken)).toBe(true);

    const rotatedKid = decodeJwtCompleteOrThrow(rotatedApiKeyToken).header
      .kid as string;

    expect(isNonEmptyString(rotatedKid)).toBe(true);
    expect(rotatedKid).not.toBe(initialKid);

    const callWithPreviousToken = await findManyApplications({
      accessToken: initialApiKeyToken,
      expectToFail: false,
    });

    expect(callWithPreviousToken.errors).toBeUndefined();
    expect(callWithPreviousToken.data?.findManyApplications).toBeDefined();

    const callWithRotatedToken = await findManyApplications({
      accessToken: rotatedApiKeyToken,
      expectToFail: false,
    });

    expect(callWithRotatedToken.errors).toBeUndefined();
    expect(callWithRotatedToken.data?.findManyApplications).toBeDefined();
  });
});
