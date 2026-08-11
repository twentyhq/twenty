import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type AccountOwnerRlsRoleSetup,
  cleanupAccountOwnerRlsRole,
  setupAccountOwnerRlsRole,
  upsertAccountOwnerRlsPredicate,
} from 'test/integration/graphql/utils/setup-account-owner-rls-role.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OWNED_COMPANY_ID = randomUUID();
const FOREIGN_COMPANY_ID = randomUUID();
const OWNED_COMPANY_NAME = 'Uncompilable RLS Owned Co';
const FOREIGN_COMPANY_NAME = 'Uncompilable RLS Foreign Co';
const PREDICATE_ID = randomUUID();

const findCompanyIdsAsRestrictedRole = async (): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter: { id: { in: [OWNED_COMPANY_ID, FOREIGN_COMPANY_ID] } },
    }),
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.companies.edges.map(
    (edge: { node: { id: string } }) => edge.node.id,
  );
};

describe('row-level permission predicates that compile to nothing', () => {
  let rlsRole: AccountOwnerRlsRoleSetup;

  beforeAll(async () => {
    for (const { id, name, accountOwnerId } of [
      {
        id: OWNED_COMPANY_ID,
        name: OWNED_COMPANY_NAME,
        accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      {
        id: FOREIGN_COMPANY_ID,
        name: FOREIGN_COMPANY_NAME,
        accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      },
    ]) {
      await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: { id, name, accountOwnerId },
        }),
      );
    }

    rlsRole = await setupAccountOwnerRlsRole({
      label: 'Uncompilable RLS Predicate Test Role',
      description: 'Role for testing RLS predicates that compile to nothing',
    });
  });

  afterAll(async () => {
    await cleanupAccountOwnerRlsRole(rlsRole);

    for (const recordId of [OWNED_COMPANY_ID, FOREIGN_COMPANY_ID]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId,
        }),
      );
    }
  });

  it('restricts records to the selected account owner', async () => {
    await upsertAccountOwnerRlsPredicate({
      setup: rlsRole,
      predicateId: PREDICATE_ID,
      value: { selectedRecordIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY] },
    });

    expect(await findCompanyIdsAsRestrictedRole()).toEqual([OWNED_COMPANY_ID]);
  });

  // An empty selection compiles to no filter at all, and a role whose only
  // predicate compiles to nothing ends up with no WHERE clause, so the
  // restriction disappears instead of matching no record.
  it('does not expose every record when a predicate selects no record', async () => {
    await upsertAccountOwnerRlsPredicate({
      setup: rlsRole,
      predicateId: PREDICATE_ID,
      value: { selectedRecordIds: [] },
      expectToFail: true,
    });

    expect(await findCompanyIdsAsRestrictedRole()).not.toContain(
      FOREIGN_COMPANY_ID,
    );
  });

  it('accepts a selection resolving to the current workspace member', async () => {
    await upsertAccountOwnerRlsPredicate({
      setup: rlsRole,
      predicateId: PREDICATE_ID,
      value: { selectedRecordIds: [], isCurrentWorkspaceMemberSelected: true },
    });
  });

  it('rejects a predicate value that is not valid for its field type and operand', async () => {
    await upsertAccountOwnerRlsPredicate({
      setup: rlsRole,
      predicateId: PREDICATE_ID,
      value: { direction: 'NEXT', amount: 30, unit: 'DAY' },
      expectToFail: true,
    });
  });
});
