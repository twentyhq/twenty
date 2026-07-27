import { randomUUID } from 'crypto';

import { COMPANY_GQL_FIELDS } from 'test/integration/constants/company-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PEOPLE_CREATED_AT = '2019-07-15T10:00:00.000Z';
const PEOPLE_WINDOW_FILTER = {
  and: [
    { createdAt: { gte: '2019-07-15T00:00:00.000Z' } },
    { createdAt: { lte: '2019-07-15T23:59:59.999Z' } },
  ],
};

describe('relation-filter and order-by respect row-level permission predicates', () => {
  const visibleCompanyId = randomUUID();
  const hiddenCompanyId = randomUUID();
  const personWithVisibleCompanyId = randomUUID();
  const personWithHiddenCompanyId = randomUUID();
  const personWithoutCompanyId = randomUUID();

  let customRoleId: string;
  let originalMemberRoleId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          name
        }
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);

    const companyNameFieldMetadata = companyObjectMetadata.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(companyNameFieldMetadata);

    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    originalMemberRoleId = memberRole.id;

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'RLS Relation Join Test Role',
        description: 'Role for testing RLS on relation-filter and order-by',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    customRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(customRoleId);

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        objectMetadataId: companyObjectMetadata.id,
        predicates: [
          {
            fieldMetadataId: companyNameFieldMetadata.id,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Visible',
          },
        ],
        predicateGroups: [],
      },
    });

    await updateWorkspaceMemberRole({
      input: {
        roleId: customRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
      expectToFail: false,
    });

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: { id: visibleCompanyId, name: 'RLS Visible Co' },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: COMPANY_GQL_FIELDS,
        data: { id: hiddenCompanyId, name: 'RLS Hidden Co' },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personWithVisibleCompanyId,
          companyId: visibleCompanyId,
          createdAt: PEOPLE_CREATED_AT,
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personWithHiddenCompanyId,
          companyId: hiddenCompanyId,
          createdAt: PEOPLE_CREATED_AT,
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: {
          id: personWithoutCompanyId,
          createdAt: PEOPLE_CREATED_AT,
        },
      }),
    );
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: originalMemberRoleId,
      },
      expectToFail: false,
    });

    for (const id of [
      personWithVisibleCompanyId,
      personWithHiddenCompanyId,
      personWithoutCompanyId,
    ]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }

    for (const id of [visibleCompanyId, hiddenCompanyId]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }

    if (customRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: customRoleId },
      });
    }
  });

  it('does not match a relation filter targeting a hidden related record', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { company: { name: { eq: 'RLS Hidden Co' } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.people.edges).toHaveLength(0);
  });

  it('matches a relation filter targeting a visible related record', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { company: { name: { eq: 'RLS Visible Co' } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const ids = response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(ids).toEqual([personWithVisibleCompanyId]);
  });

  it('sorts records linked to a hidden related record as null when ordering by that relation', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: PEOPLE_WINDOW_FILTER,
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        first: 10,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const [personIdWithNonNullSortKey, ...personIdsSortedAsNull] =
      response.body.data.people.edges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      );

    expect(personIdWithNonNullSortKey).toBe(personWithVisibleCompanyId);
    expect(personIdsSortedAsNull).toEqual(
      expect.arrayContaining([
        personWithHiddenCompanyId,
        personWithoutCompanyId,
      ]),
    );
    expect(personIdsSortedAsNull).toHaveLength(2);
  });
});
