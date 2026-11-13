import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type AccountOwnerRlsRoleSetup,
  cleanupAccountOwnerRlsRole,
  setupAccountOwnerRlsRole,
  upsertAccountOwnerRlsPredicate,
} from 'test/integration/graphql/utils/setup-account-owner-rls-role.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OWNED_COMPANY_ID = randomUUID();
const FOREIGN_COMPANY_ID = randomUUID();
const COMPANY_IDS = [OWNED_COMPANY_ID, FOREIGN_COMPANY_ID];
const INITIAL_NAME = 'RLS Bulk Write Co';
const UPDATED_NAME = 'RLS Bulk Write Co Updated';

const findCompanyNamesAsAdmin = async (): Promise<Record<string, string>> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id name',
      filter: { id: { in: COMPANY_IDS } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return Object.fromEntries(
    response.body.data.companies.edges.map(
      (edge: { node: { id: string; name: string } }) => [
        edge.node.id,
        edge.node.name,
      ],
    ),
  );
};

describe('bulk writes on records restricted by an RLS rule', () => {
  let rlsRole: AccountOwnerRlsRoleSetup;

  beforeAll(async () => {
    for (const { id, accountOwnerId } of [
      {
        id: OWNED_COMPANY_ID,
        accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      {
        id: FOREIGN_COMPANY_ID,
        accountOwnerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      },
    ]) {
      await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: COMPANY_GQL_FIELDS,
          data: { id, name: INITIAL_NAME, accountOwnerId },
        }),
      );
    }

    rlsRole = await setupAccountOwnerRlsRole({
      label: 'RLS Bulk Write Test Role',
      description: 'Role whose RLS rule keeps writes to owned companies',
    });

    await upsertAccountOwnerRlsPredicate({
      setup: rlsRole,
      predicateId: randomUUID(),
      value: { selectedRecordIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY] },
    });
  });

  afterAll(async () => {
    await cleanupAccountOwnerRlsRole(rlsRole);

    for (const recordId of COMPANY_IDS) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId,
        }),
      );
    }
  });

  it('updates only the records the rule lets the caller write', async () => {
    const response = await makeGraphqlApiRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: { name: UPDATED_NAME },
        filter: { id: { in: COMPANY_IDS } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.updateCompanies.map(({ id }: { id: string }) => id),
    ).toEqual([OWNED_COMPANY_ID]);
    expect(await findCompanyNamesAsAdmin()).toEqual({
      [OWNED_COMPANY_ID]: UPDATED_NAME,
      [FOREIGN_COMPANY_ID]: INITIAL_NAME,
    });
  });
});
