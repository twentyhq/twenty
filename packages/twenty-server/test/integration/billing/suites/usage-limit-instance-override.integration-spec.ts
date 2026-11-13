import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { type Repository } from 'typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitInstanceOverrideExpiryCronJob } from 'src/engine/core-modules/usage-limit/instance-override/crons/usage-limit-instance-override-expiry.cron.job';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
    $endsAt: DateTime
  ) {
    createWorkspaceUsageLimit(
      workspaceId: $workspaceId
      payload: $payload
      endsAt: $endsAt
    ) {
      id
    }
  }
`;

const DELETE_WORKSPACE_USAGE_LIMIT = gql`
  mutation DeleteWorkspaceUsageLimit(
    $workspaceId: UUID!
    $usageLimitId: UUID!
  ) {
    deleteWorkspaceUsageLimit(
      workspaceId: $workspaceId
      usageLimitId: $usageLimitId
    )
  }
`;

const STORAGE_STOCK_PAYLOAD = {
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: null,
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  unit: UsageUnit.BYTE,
  limitValue: 5_000_000,
  burstValue: null,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe('Usage limit instance overrides', () => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  const readConfig = twentyConfigService.get.bind(twentyConfigService);

  let usageLimitRepository: Repository<UsageLimitEntity>;
  let billingArrangementRepository: Repository<BillingArrangementEntity>;

  const createLimitOverride = (endsAt?: Date) =>
    makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: STORAGE_STOCK_PAYLOAD,
        endsAt: endsAt?.toISOString(),
      },
    });

  const createLimitOverrideId = async (endsAt?: Date): Promise<string> => {
    const response = await createLimitOverride(endsAt);

    const usageLimitId = response.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    return usageLimitId;
  };

  const findLimitOverrides = (usageLimitId: string) =>
    billingArrangementRepository.find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        type: BillingArrangementType.LIMIT_OVERRIDE,
        usageLimitId,
      },
    });

  beforeAll(() => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    billingArrangementRepository = getCoreRepository<BillingArrangementEntity>(
      BillingArrangementEntity,
    );

    jest
      .spyOn(twentyConfigService, 'get')
      .mockImplementation((key) =>
        key === 'WORKSPACE_STORAGE_LIMIT_BYTES' ? 10_000_000 : readConfig(key),
      );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    await usageLimitRepository.delete({ workspaceId: SEED_APPLE_WORKSPACE_ID });
    await billingArrangementRepository.delete({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  });

  it('records who granted an override created from the admin panel', async () => {
    const usageLimitId = await createLimitOverrideId();

    expect(await findLimitOverrides(usageLimitId)).toEqual([
      expect.objectContaining({
        grantedByUserId: USER_DATA_SEED_IDS.JANE,
        endsAt: null,
        revokedAt: null,
      }),
    ]);
  });

  it('records the end date given when an operator creates an override', async () => {
    const endsAt = new Date(Date.now() + ONE_DAY_MS);

    const usageLimitId = await createLimitOverrideId(endsAt);

    expect(await findLimitOverrides(usageLimitId)).toEqual([
      expect.objectContaining({ endsAt }),
    ]);
  });

  it('refuses an override that ends in the past', async () => {
    const response = await createLimitOverride(new Date(Date.now() - 60_000));

    expect(response.body.errors).toBeDefined();
    expect(
      await usageLimitRepository.countBy({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe(0);
    expect(
      await billingArrangementRepository.countBy({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe(0);
  });

  it('records who revoked an override removed from the admin panel', async () => {
    const usageLimitId = await createLimitOverrideId();

    const response = await makeAdminPanelApiRequest({
      query: DELETE_WORKSPACE_USAGE_LIMIT,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID, usageLimitId },
    });

    expect(response.body.data?.deleteWorkspaceUsageLimit).toBe(true);
    expect(await usageLimitRepository.existsBy({ id: usageLimitId })).toBe(
      false,
    );
    expect(await findLimitOverrides(usageLimitId)).toEqual([
      expect.objectContaining({ revokedByUserId: USER_DATA_SEED_IDS.JANE }),
    ]);
  });

  it('removes the usage limit of an override however long ago it ended', async () => {
    const usageLimitId = await createLimitOverrideId();

    await billingArrangementRepository.update(
      { workspaceId: SEED_APPLE_WORKSPACE_ID, usageLimitId },
      {
        startsAt: new Date(Date.now() - 8 * ONE_DAY_MS),
        endsAt: new Date(Date.now() - 7 * ONE_DAY_MS),
      },
    );

    await runSyncCron(UsageLimitInstanceOverrideExpiryCronJob);

    expect(await usageLimitRepository.existsBy({ id: usageLimitId })).toBe(
      false,
    );
    expect(await findLimitOverrides(usageLimitId)).toEqual([
      expect.objectContaining({ revokedAt: null }),
    ]);
  });
});
