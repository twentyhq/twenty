import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const CLAIM_TTL_MS = 5 * 60 * 1000;

describe('campaignDelivery claim protocol (integration)', () => {
  let dataSource: DataSource;
  let campaignDeliveryTableName: string;
  const seededDeliveryIds: string[] = [];

  const claim = async (
    deliveryId: string,
  ): Promise<{ claimToken: string; won: boolean }> => {
    const claimToken = v4();

    const [, affected] = await dataSource.query(
      `UPDATE ${campaignDeliveryTableName}
          SET "state" = 'SENDING', "claimToken" = $1, "claimExpiresAt" = $2
        WHERE "id" = $3 AND "state" IN ('QUEUED', 'FAILED')`,
      [claimToken, new Date(Date.now() + CLAIM_TTL_MS), deliveryId],
    );

    return { claimToken, won: affected === 1 };
  };

  const settle = async (
    deliveryId: string,
    claimToken: string,
  ): Promise<number> => {
    const [, affected] = await dataSource.query(
      `UPDATE ${campaignDeliveryTableName}
          SET "state" = 'SENT', "claimToken" = NULL, "claimExpiresAt" = NULL
        WHERE "id" = $1 AND "claimToken" = $2`,
      [deliveryId, claimToken],
    );

    return affected;
  };

  const seedQueuedDelivery = async (): Promise<string> => {
    const deliveryId = v4();

    await dataSource.query(
      `INSERT INTO ${campaignDeliveryTableName}
         ("id", "campaignId", "personId", "recipientEmail", "state")
       VALUES ($1, $2, $3, $4, 'QUEUED')`,
      [deliveryId, v4(), v4(), `claim-test-${deliveryId}@example.com`],
    );

    seededDeliveryIds.push(deliveryId);

    return deliveryId;
  };

  const readDelivery = async (
    deliveryId: string,
  ): Promise<{ state: string; claimToken: string | null }> => {
    const [row] = await dataSource.query(
      `SELECT "state", "claimToken" FROM ${campaignDeliveryTableName} WHERE "id" = $1`,
      [deliveryId],
    );

    return row;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    campaignDeliveryTableName = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."campaignDelivery"`;
  });

  afterAll(async () => {
    if (seededDeliveryIds.length > 0) {
      await dataSource.query(
        `DELETE FROM ${campaignDeliveryTableName} WHERE "id" = ANY($1)`,
        [seededDeliveryIds],
      );
    }

    await dataSource.destroy();
  });

  it('lets exactly one of two concurrent workers claim the same delivery', async () => {
    const deliveryId = await seedQueuedDelivery();

    const [first, second] = await Promise.all([
      claim(deliveryId),
      claim(deliveryId),
    ]);

    expect([first.won, second.won].filter(Boolean)).toHaveLength(1);
  });

  it('refuses the losing worker a settle, so it can neither record nor bill the send', async () => {
    const deliveryId = await seedQueuedDelivery();

    const [first, second] = await Promise.all([
      claim(deliveryId),
      claim(deliveryId),
    ]);

    const winner = first.won ? first : second;
    const loser = first.won ? second : first;

    expect(await settle(deliveryId, loser.claimToken)).toBe(0);
    expect(await settle(deliveryId, winner.claimToken)).toBe(1);
    expect(await readDelivery(deliveryId)).toEqual({
      state: 'SENT',
      claimToken: null,
    });
  });

  it('refuses a stale claim token after the sweeper reclaims an expired lease', async () => {
    const deliveryId = await seedQueuedDelivery();
    const abandoned = await claim(deliveryId);

    await dataSource.query(
      `UPDATE ${campaignDeliveryTableName}
          SET "claimExpiresAt" = $1 WHERE "id" = $2`,
      [new Date(Date.now() - 1), deliveryId],
    );

    await dataSource.query(
      `UPDATE ${campaignDeliveryTableName}
          SET "state" = 'FAILED', "failureReason" = 'CLAIM_EXPIRED',
              "claimToken" = NULL, "claimExpiresAt" = NULL
        WHERE "id" = $1 AND "state" = 'SENDING' AND "claimExpiresAt" < now()`,
      [deliveryId],
    );

    const reclaimed = await claim(deliveryId);

    expect(reclaimed.won).toBe(true);
    expect(await settle(deliveryId, abandoned.claimToken)).toBe(0);
    expect(await settle(deliveryId, reclaimed.claimToken)).toBe(1);
  });
});
