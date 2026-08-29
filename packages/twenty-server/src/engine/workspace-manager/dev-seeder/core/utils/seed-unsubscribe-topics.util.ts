import { type QueryRunner } from 'typeorm';

import { UnsubscribeTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-topic-visibility.type';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

const tableName = 'unsubscribeTopic';

const UNSUBSCRIBE_TOPIC_SEEDS = [
  {
    seedName: 'unsubscribe-topic-product-updates',
    name: 'Product updates',
    description: 'New features, improvements and release notes',
    visibility: UnsubscribeTopicVisibility.PUBLIC,
  },
  {
    seedName: 'unsubscribe-topic-newsletter',
    name: 'Monthly newsletter',
    description: 'A monthly digest of company news',
    visibility: UnsubscribeTopicVisibility.PUBLIC,
  },
  {
    seedName: 'unsubscribe-topic-events',
    name: 'Events and webinars',
    description: 'Invitations to live events and webinars',
    visibility: UnsubscribeTopicVisibility.PUBLIC,
  },
] as const;

export type SeededUnsubscribeTopicName =
  (typeof UNSUBSCRIBE_TOPIC_SEEDS)[number]['seedName'];

export const getSeededUnsubscribeTopicIds = (
  workspaceId: string,
): Record<SeededUnsubscribeTopicName, string> =>
  Object.fromEntries(
    UNSUBSCRIBE_TOPIC_SEEDS.map(({ seedName }) => [
      seedName,
      generateSeedId(workspaceId, seedName),
    ]),
  ) as Record<SeededUnsubscribeTopicName, string>;

type SeedUnsubscribeTopicsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedUnsubscribeTopics = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedUnsubscribeTopicsArgs) => {
  const topicIds = getSeededUnsubscribeTopicIds(workspaceId);

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'workspaceId',
      'name',
      'description',
      'visibility',
    ])
    .orIgnore()
    .values(
      UNSUBSCRIBE_TOPIC_SEEDS.map(
        ({ seedName, name, description, visibility }) => ({
          id: topicIds[seedName],
          workspaceId,
          name,
          description,
          visibility,
        }),
      ),
    )
    .execute();
};
