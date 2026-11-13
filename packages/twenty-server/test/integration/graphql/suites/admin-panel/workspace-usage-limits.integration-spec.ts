import { makeAdminPanelApiRequestAsNonServerAdmin } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-as-non-server-admin.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { type Repository } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const WORKSPACE_USAGE_LIMITS = gql`
  query WorkspaceUsageLimits($workspaceId: UUID!) {
    workspaceUsageLimits(workspaceId: $workspaceId) {
      defaults {
        resourceType
        operationType
        spenderType
        limitKind
        unit
        limitValue
        isOverridable
        overriddenByUsageLimitId
      }
      limits {
        id
        limitValue
      }
    }
  }
`;

const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
  ) {
    createWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
      id
      limitValue
    }
  }
`;

const UPDATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation UpdateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: UpdateUsageLimitInput!
  ) {
    updateWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
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

const USER_CREDIT_QUOTA_PAYLOAD = {
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.ALL,
  spenderType: 'userWorkspace',
  spenderId: null,
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'week',
  unit: UsageUnit.USER_CREDIT,
  limitValue: 0,
  burstValue: null,
};

describe('Workspace usage limits from the admin panel', () => {
  const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
    'TwentyConfigService',
  );
  const readConfig = twentyConfigService.get.bind(twentyConfigService);

  let usageLimitRepository: Repository<UsageLimitEntity>;
  let instanceAiUserCreditsLimit: number | undefined;

  const createWorkspaceUsageLimit = async (
    payload: typeof STORAGE_STOCK_PAYLOAD | typeof USER_CREDIT_QUOTA_PAYLOAD,
  ): Promise<string> => {
    const response = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID, payload },
    });

    const usageLimitId = response.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    return usageLimitId;
  };

  const findWorkspaceUsageLimits = async () => {
    const response = await makeAdminPanelApiRequest({
      query: WORKSPACE_USAGE_LIMITS,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID },
    });

    return response.body.data?.workspaceUsageLimits;
  };

  beforeAll(() => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);

    jest.spyOn(twentyConfigService, 'get').mockImplementation((key) => {
      if (key === 'WORKSPACE_STORAGE_LIMIT_BYTES') {
        return 10_000_000;
      }

      if (key === 'AI_USER_CREDITS_LIMIT') {
        return instanceAiUserCreditsLimit;
      }

      return readConfig(key);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    instanceAiUserCreditsLimit = 5_000_000;
  });

  afterEach(async () => {
    await usageLimitRepository.delete({ workspaceId: SEED_APPLE_WORKSPACE_ID });
  });

  it('lists the instance defaults that apply to the workspace', async () => {
    const workspaceUsageLimits = await findWorkspaceUsageLimits();

    jestExpectToBeDefined(workspaceUsageLimits);

    expect(workspaceUsageLimits.defaults).toContainEqual(
      expect.objectContaining({
        resourceType: UsageResourceType.STORAGE,
        limitKind: 'stock',
        unit: UsageUnit.BYTE,
        isOverridable: true,
        overriddenByUsageLimitId: null,
      }),
    );
    expect(workspaceUsageLimits.limits).toEqual([]);
  });

  it('lets an operator replace a default the workspace cannot touch', async () => {
    const response = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: STORAGE_STOCK_PAYLOAD,
      },
    });

    const usageLimitId = response.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    expect(
      (await usageLimitRepository.findOneByOrFail({ id: usageLimitId }))
        .isInstanceOverride,
    ).toBe(true);

    const workspaceUsageLimits = await findWorkspaceUsageLimits();

    expect(workspaceUsageLimits.limits).toHaveLength(1);
    expect(
      workspaceUsageLimits.defaults.find(
        (usageLimitDefault: {
          resourceType: UsageResourceType;
          operationType: UsageOperationType;
          spenderType: string;
          unit: UsageUnit;
        }) =>
          usageLimitDefault.resourceType === UsageResourceType.STORAGE &&
          usageLimitDefault.operationType === UsageOperationType.STORAGE_FILE &&
          usageLimitDefault.spenderType === 'workspace' &&
          usageLimitDefault.unit === UsageUnit.BYTE,
      ),
    ).toEqual(
      expect.objectContaining({ overriddenByUsageLimitId: usageLimitId }),
    );
  });

  it('lets an operator override the AI credits each member gets per week', async () => {
    const usageLimitId = await createWorkspaceUsageLimit(
      USER_CREDIT_QUOTA_PAYLOAD,
    );

    const workspaceUsageLimits = await findWorkspaceUsageLimits();

    expect(workspaceUsageLimits.defaults).toContainEqual(
      expect.objectContaining({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.ALL,
        spenderType: 'userWorkspace',
        unit: UsageUnit.USER_CREDIT,
        isOverridable: true,
        overriddenByUsageLimitId: usageLimitId,
      }),
    );
  });

  it('lists the member AI credit default without a value when the instance sets none, so an operator can override it', async () => {
    instanceAiUserCreditsLimit = undefined;

    const usageLimitId = await createWorkspaceUsageLimit({
      ...USER_CREDIT_QUOTA_PAYLOAD,
      limitValue: 3_000_000,
    });

    const workspaceUsageLimits = await findWorkspaceUsageLimits();

    expect(workspaceUsageLimits.defaults).toContainEqual(
      expect.objectContaining({
        resourceType: UsageResourceType.AI,
        operationType: UsageOperationType.ALL,
        spenderType: 'userWorkspace',
        unit: UsageUnit.USER_CREDIT,
        limitValue: null,
        isOverridable: true,
        overriddenByUsageLimitId: usageLimitId,
      }),
    );
  });

  it('lets an operator remove the override it created', async () => {
    const createResponse = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        payload: STORAGE_STOCK_PAYLOAD,
      },
    });

    const usageLimitId =
      createResponse.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    const deleteResponse = await makeAdminPanelApiRequest({
      query: DELETE_WORKSPACE_USAGE_LIMIT,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID, usageLimitId },
    });

    expect(deleteResponse.body.data?.deleteWorkspaceUsageLimit).toBe(true);
    expect(
      await usageLimitRepository.countBy({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe(0);
  });

  describe('a workspace admin who is not an operator', () => {
    const setJaneIsOperator = async (canAccessFullAdminPanel: boolean) => {
      await getCoreRepository<UserEntity>(UserEntity).update(
        { id: USER_DATA_SEED_IDS.JANE },
        { canAccessFullAdminPanel },
      );
      await getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      ).invalidate('user', USER_DATA_SEED_IDS.JANE);
    };

    beforeEach(() => setJaneIsOperator(false));
    afterEach(() => setJaneIsOperator(true));

    it.each([
      [
        'the query',
        WORKSPACE_USAGE_LIMITS,
        { workspaceId: SEED_APPLE_WORKSPACE_ID },
      ],
      [
        'create',
        CREATE_WORKSPACE_USAGE_LIMIT,
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: STORAGE_STOCK_PAYLOAD,
        },
      ],
      [
        'update',
        UPDATE_WORKSPACE_USAGE_LIMIT,
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          payload: {
            id: '3a2f1e5c-6b7d-4e8f-9a0b-1c2d3e4f5a6b',
            payload: STORAGE_STOCK_PAYLOAD,
          },
        },
      ],
      [
        'delete',
        DELETE_WORKSPACE_USAGE_LIMIT,
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          usageLimitId: '3a2f1e5c-6b7d-4e8f-9a0b-1c2d3e4f5a6b',
        },
      ],
    ])('is refused on %s', async (_label, query, variables) => {
      const response = await makeAdminPanelApiRequest({ query, variables });

      expect(response.body.errors).toBeDefined();
      expect(
        await usageLimitRepository.countBy({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).toBe(0);
    });
  });

  it('refuses a user without server admin access', async () => {
    const response = await makeAdminPanelApiRequestAsNonServerAdmin({
      query: WORKSPACE_USAGE_LIMITS,
      variables: { workspaceId: SEED_APPLE_WORKSPACE_ID },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data?.workspaceUsageLimits).toBeFalsy();
  });
});
