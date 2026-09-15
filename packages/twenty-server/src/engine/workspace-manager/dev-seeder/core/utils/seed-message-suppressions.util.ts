import { type QueryRunner } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import {
  getSeededUnsubscribeTopicIds,
  type SeededUnsubscribeTopicName,
} from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-unsubscribe-topics.util';

const tableName = 'messageSuppression';

type MessageSuppressionSeed = {
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId: string | null;
  topicSeedName: SeededUnsubscribeTopicName | null;
};

// Addresses are taken from the seeded people so the unsubscribers list lines up
// with records that exist in the workspace.
const MESSAGE_SUPPRESSION_SEEDS: MessageSuppressionSeed[] = [
  {
    emailAddress: 'mark.young@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: null,
  },
  {
    emailAddress: 'gabriel.robinson@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: null,
  },
  {
    emailAddress: 'kimberly.gordon@example.com',
    reason: MessageSuppressionReason.BOUNCE,
    source: MessageSuppressionSource.WEBHOOK,
    providerEventId: 'seed-bounce-event-1',
    topicSeedName: null,
  },
  {
    emailAddress: 'cindy.baker@example.com',
    reason: MessageSuppressionReason.BOUNCE,
    source: MessageSuppressionSource.WEBHOOK,
    providerEventId: 'seed-bounce-event-2',
    topicSeedName: null,
  },
  {
    emailAddress: 'anthony.may@example.com',
    reason: MessageSuppressionReason.COMPLAINT,
    source: MessageSuppressionSource.WEBHOOK,
    providerEventId: 'seed-complaint-event-1',
    topicSeedName: null,
  },
  {
    emailAddress: 'vicki.meyer@example.com',
    reason: MessageSuppressionReason.COMPLAINT,
    source: MessageSuppressionSource.WEBHOOK,
    providerEventId: 'seed-complaint-event-2',
    topicSeedName: null,
  },
  {
    emailAddress: 'billy.mckinney@example.com',
    reason: MessageSuppressionReason.BOUNCE,
    source: MessageSuppressionSource.WEBHOOK,
    providerEventId: 'seed-bounce-event-3',
    topicSeedName: null,
  },
  {
    emailAddress: 'andrew.king@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: null,
  },
  {
    emailAddress: 'todd.jones@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-product-updates',
  },
  {
    emailAddress: 'gregory.perez@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-product-updates',
  },
  {
    emailAddress: 'vanessa.farmer@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-newsletter',
  },
  {
    emailAddress: 'elizabeth.chung@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-newsletter',
  },
  {
    emailAddress: 'melissa.huerta@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-events',
  },
  {
    emailAddress: 'debbie.johnson@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-events',
  },
  // Also globally suppressed above, to cover an address that opted out of a
  // single topic before unsubscribing from everything.
  {
    emailAddress: 'mark.young@example.com',
    reason: MessageSuppressionReason.UNSUBSCRIBE,
    source: MessageSuppressionSource.SYSTEM,
    providerEventId: null,
    topicSeedName: 'unsubscribe-topic-newsletter',
  },
];

type SeedMessageSuppressionsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedMessageSuppressions = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedMessageSuppressionsArgs) => {
  const topicIds = getSeededUnsubscribeTopicIds(workspaceId);

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'emailAddress',
      'reason',
      'source',
      'providerEventId',
      'unsubscribeTopicId',
    ])
    .orIgnore()
    .values(
      MESSAGE_SUPPRESSION_SEEDS.map(
        ({ emailAddress, reason, source, providerEventId, topicSeedName }) => ({
          workspaceId,
          emailAddress,
          reason,
          source,
          providerEventId,
          unsubscribeTopicId: isDefined(topicSeedName)
            ? topicIds[topicSeedName]
            : null,
        }),
      ),
    )
    .execute();
};
