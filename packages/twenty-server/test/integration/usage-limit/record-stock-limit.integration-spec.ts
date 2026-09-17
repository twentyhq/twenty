import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { createClient } from 'redis';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const HEADROOM = 2;

// Rockets rather than people: the seeded workspace runs a workflow on every
// person upsert, and its run row is itself a record the stock charges.
describe('Record stock limit', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;
  let usageLimitId: string;
  const createdRocketIds: string[] = [];

  const createRockets = async (count: number) => {
    const ids = Array.from({ length: count }, () => v4());

    createdRocketIds.push(...ids);

    return makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rocket',
        objectMetadataPluralName: 'rockets',
        gqlFields: 'id',
        data: ids.map((id) => ({ id, name: 'Record stock test' })),
      }),
    );
  };

  const softDeleteRockets = (ids: string[]) =>
    makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'rocket',
        objectMetadataPluralName: 'rockets',
        gqlFields: 'id',
        filter: { id: { in: ids } },
      }),
    );

  const destroyRockets = (ids: string[]) =>
    makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'rocket',
        objectMetadataPluralName: 'rockets',
        gqlFields: 'id',
        filter: { id: { in: ids } },
      }),
    );

  // The same recount the stock service runs when its counter is cold: every
  // object table of the schema, timeline activities left out.
  const countRecords = async (): Promise<number> => {
    const tables: { table_name: string }[] = await global.testDataSource.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = $1 AND table_type = 'BASE TABLE'
       AND table_name <> 'timelineActivity'`,
      [SCHEMA_NAME],
    );

    const counts: { quantity: string }[][] = await Promise.all(
      tables.map(({ table_name }) =>
        global.testDataSource.query(
          `SELECT COUNT(*) AS quantity FROM "${SCHEMA_NAME}"."${table_name}"`,
        ),
      ),
    );

    return counts.reduce((sum, [row]) => sum + Number(row.quantity), 0);
  };

  const dropKeys = async (pattern: string) => {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  };

  // A cold counter re-warms from the table counts, so every test starts with
  // the full headroom whatever the previous one charged or released.
  const dropStockCounter = () =>
    dropKeys(`*{${SEED_APPLE_WORKSPACE_ID}}:stock:RECORD:*`);

  const expectRefused = (response: { body: { errors?: unknown[] } }) => {
    expect(
      (response.body.errors?.[0] as { extensions?: { subCode?: string } })
        ?.extensions?.subCode,
    ).toBe('STOCK_EXHAUSTED');
  };

  const expectAdmitted = (response: { body: { errors?: unknown[] } }) => {
    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();

    const [usageLimit] = await usageLimitRepository.save([
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.RECORD,
        operationType: UsageOperationType.RECORD_WRITE,
        spenderType: 'workspace',
        spenderId: '',
        limitKind: 'stock',
        periodCount: 1,
        periodUnit: 'lifetime',
        meter: 'quantity',
        limitValue: (await countRecords()) + HEADROOM,
        burstValue: null,
      },
    ]);

    usageLimitId = usageLimit.id;

    await dropKeys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`);
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  beforeEach(async () => {
    await dropStockCounter();
  });

  afterEach(async () => {
    if (createdRocketIds.length > 0) {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA_NAME}"."_rocket" WHERE id = ANY($1)`,
        [createdRocketIds],
      );
      createdRocketIds.length = 0;
    }
  });

  afterAll(async () => {
    await usageLimitRepository.delete({ id: usageLimitId });
    await dropKeys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`);
    await dropStockCounter();
    await redis.quit();
  });

  it('refuses the write that would cross the limit', async () => {
    expectAdmitted(await createRockets(HEADROOM));
    expectRefused(await createRockets(1));
  });

  it('refuses a batch as a whole when only part of it fits', async () => {
    expectRefused(await createRockets(HEADROOM + 1));
    expectAdmitted(await createRockets(HEADROOM));
  });

  it('gives the capacity back when records are destroyed', async () => {
    const admitted = await createRockets(HEADROOM);

    expectAdmitted(admitted);
    expectRefused(await createRockets(1));

    await destroyRockets([admitted.body.data.createRockets[0].id]);

    expectAdmitted(await createRockets(1));
  });

  it('keeps soft-deleted records counted until they are destroyed', async () => {
    const admitted = await createRockets(HEADROOM);

    expectAdmitted(admitted);

    await softDeleteRockets([admitted.body.data.createRockets[0].id]);

    expectRefused(await createRockets(1));
  });
});
