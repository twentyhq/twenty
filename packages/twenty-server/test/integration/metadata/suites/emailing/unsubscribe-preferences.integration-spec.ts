import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const UPDATE_PREFERENCES_PATH = '/emailing/unsubscribe/preferences';

describe('Unsubscribe preferences page (integration)', () => {
  let unsubscribeTokenService: UnsubscribeTokenService;
  let newsletterTopicId: string;

  const findSuppressionTopicIds = async (emailAddress: string) => {
    const suppressions = await getCoreRepository<MessageSuppressionEntity>(
      MessageSuppressionEntity,
    ).findBy({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
    });

    return suppressions.map((suppression) => suppression.unsubscribeTopicId);
  };

  const submitPreferences = (emailAddress: string) =>
    request(`http://localhost:${APP_PORT}`)
      .post(UPDATE_PREFERENCES_PATH)
      .type('form')
      .send({
        t: unsubscribeTokenService.sign({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          emailAddress,
        }),
      });

  beforeAll(async () => {
    unsubscribeTokenService =
      getAppProviderByClassName<UnsubscribeTokenService>(
        'UnsubscribeTokenService',
      );

    const newsletterTopic = await getCoreRepository<UnsubscribeTopicEntity>(
      UnsubscribeTopicEntity,
    ).save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      name: 'Newsletter',
      visibility: UnsubscribeTopicVisibility.PUBLIC,
    });

    newsletterTopicId = newsletterTopic.id;
  }, 60000);

  afterAll(async () => {
    await getCoreRepository<MessageSuppressionEntity>(MessageSuppressionEntity)
      .createQueryBuilder()
      .delete()
      .where('"workspaceId" = :workspaceId', {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      })
      .andWhere(
        '("emailAddress" LIKE :topicOnly OR "emailAddress" LIKE :stillOut)',
        { topicOnly: 'topic-only-%', stillOut: 'still-out-%' },
      )
      .execute();

    await getCoreRepository<UnsubscribeTopicEntity>(
      UnsubscribeTopicEntity,
    ).delete({ id: newsletterTopicId });
  });

  it('opts out of the unticked topic only, not every marketing email', async () => {
    const emailAddress = `topic-only-${randomUUID()}@acme.com`;

    const response = await submitPreferences(emailAddress);

    expect(response.status).toBe(201);
    expect(await findSuppressionTopicIds(emailAddress)).toContain(
      newsletterTopicId,
    );
    expect(await findSuppressionTopicIds(emailAddress)).not.toContain(null);
  }, 60000);

  it('keeps an earlier unsubscribe from everything when no topic is ticked', async () => {
    const emailAddress = `still-out-${randomUUID()}@acme.com`;

    await getCoreRepository<MessageSuppressionEntity>(
      MessageSuppressionEntity,
    ).save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
      unsubscribeTopicId: null,
    });

    await submitPreferences(emailAddress);

    expect(await findSuppressionTopicIds(emailAddress)).toContain(null);
  }, 60000);
});
