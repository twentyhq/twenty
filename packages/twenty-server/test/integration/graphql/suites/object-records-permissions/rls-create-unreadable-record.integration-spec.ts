import { randomUUID } from 'crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type AccountOwnerRlsRoleSetup,
  cleanupAccountOwnerRlsRole,
  setupAccountOwnerRlsRole,
} from 'test/integration/graphql/utils/setup-account-owner-rls-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const COMPANY_ID = randomUUID();

describe('creating a record the caller cannot read back', () => {
  let rlsRole: AccountOwnerRlsRoleSetup;

  beforeAll(async () => {
    rlsRole = await setupAccountOwnerRlsRole({
      label: 'RLS Create Unreadable Test Role',
      description: 'Role that creates companies it cannot read',
    });

    const accountOwnerPredicate = (workspaceMemberId: string) => ({
      id: randomUUID(),
      fieldMetadataId: rlsRole.accountOwnerFieldMetadataId,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: { selectedRecordIds: [workspaceMemberId] },
    });

    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId: rlsRole.customRoleId,
        objectMetadataId: rlsRole.companyObjectMetadataId,
        rules: [
          {
            canCreateRecords: true,
            canReadRecords: false,
            predicates: [
              accountOwnerPredicate(WORKSPACE_MEMBER_DATA_SEED_IDS.TIM),
            ],
          },
          {
            canReadRecords: true,
            predicates: [
              accountOwnerPredicate(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY),
            ],
          },
        ],
      },
    });
  });

  afterAll(async () => {
    await cleanupAccountOwnerRlsRole(rlsRole);

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: COMPANY_ID,
      }),
    );
  });

  it('answers forbidden instead of a server error', async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id name',
        data: {
          id: COMPANY_ID,
          name: 'RLS Create Unreadable Co',
          accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
