import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperation } from 'test/integration/graphql/utils/destroy-one-operation.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type FormulaPerson = {
  id: string;
  formulaJobShout: string;
  formulaCompanyLabel: string;
  formulaAvatarMark: string;
};

const FORMULA_GQL_FIELDS =
  'id formulaJobShout formulaCompanyLabel formulaAvatarMark';

const FORMULAS = [
  { name: 'formulaJobShout', expression: 'upper(jobTitle)' },
  {
    name: 'formulaCompanyLabel',
    expression: 'concat("Employees: ", company.employees)',
  },
  { name: 'formulaAvatarMark', expression: 'concat(avatarUrl, "!")' },
];

describe('formula fields should not reveal values the reader cannot read (integration)', () => {
  let personObjectMetadataId: string;
  let companyObjectMetadataId: string;
  let originalMemberRoleId: string;
  let people: { id: string }[];
  let companyIds: string[];
  const formulaFieldMetadataIds: string[] = [];
  const roleIds: string[] = [];

  const listPeople = async (token?: string): Promise<FormulaPerson[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: FORMULA_GQL_FIELDS,
        filter: { id: { in: people.map(({ id }) => id) } },
        orderBy: [{ id: 'AscNullsLast' }],
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.people.edges.map(
      (edge: { node: FormulaPerson }) => edge.node,
    );
  };

  const assignNewRoleToMember = async (label: string): Promise<string> => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label,
        description: label,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const roleId: string = data.createOneRole.id;

    roleIds.push(roleId);

    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: { roleId, workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
    });

    return roleId;
  };

  const hideField = async ({
    roleId,
    objectMetadataId,
    fieldName,
    rowLevelPermissionPredicateGroupId,
  }: {
    roleId: string;
    objectMetadataId: string;
    fieldName: string;
    rowLevelPermissionPredicateGroupId?: string;
  }) =>
    upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId: await findFieldMetadataIdByName({
              objectMetadataId,
              fieldName,
            }),
            rowLevelPermissionPredicateGroupId,
            canReadFieldValue: false,
          },
        ],
      },
    });

  beforeAll(async () => {
    [personObjectMetadataId, companyObjectMetadataId] = await Promise.all([
      findObjectMetadataIdByName('person'),
      findObjectMetadataIdByName('company'),
    ]);
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    // Other suites delete every person, so the seeded ones cannot be relied on
    const personIds = [v4(), v4()].sort();

    companyIds = [v4(), v4()];
    people = personIds.map((id) => ({ id }));

    for (const [index, id] of companyIds.entries()) {
      await createOneOperation({
        objectMetadataSingularName: 'company',
        input: {
          id,
          name: `Formula permissions company ${index}`,
          employees: 42,
        },
      });
    }

    for (const [index, id] of personIds.entries()) {
      await createOneOperation({
        objectMetadataSingularName: 'person',
        input: {
          id,
          companyId: companyIds[index],
          avatarUrl: 'Secret avatar',
          jobTitle: index === 0 ? 'Paris office' : 'London office',
        },
      });
    }

    for (const { name, expression } of FORMULAS) {
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          name,
          label: name,
          type: FieldMetadataType.TEXT,
          objectMetadataId: personObjectMetadataId,
          isLabelSyncedWithName: false,
          settings: { formula: { expression } },
        },
        gqlFields: 'id',
      });

      formulaFieldMetadataIds.push(data.createOneField.id);
    }
  }, 120000);

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });

    for (const idToDelete of roleIds) {
      await deleteOneRole({ expectToFail: false, input: { idToDelete } });
    }

    for (const idToDelete of formulaFieldMetadataIds) {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
        gqlFields: 'id',
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete },
      });
    }

    for (const { id } of people) {
      await destroyOneOperation({
        objectMetadataSingularName: 'person',
        recordId: id,
      });
    }

    for (const recordId of companyIds) {
      await destroyOneOperation({
        objectMetadataSingularName: 'company',
        recordId,
      });
    }
  }, 120000);

  it('should compute every formula for a reader without restriction', async () => {
    expect(await listPeople()).toEqual([
      {
        id: people[0].id,
        formulaJobShout: 'PARIS OFFICE',
        formulaCompanyLabel: 'Employees: 42',
        formulaAvatarMark: 'Secret avatar!',
      },
      {
        id: people[1].id,
        formulaJobShout: 'LONDON OFFICE',
        formulaCompanyLabel: 'Employees: 42',
        formulaAvatarMark: 'Secret avatar!',
      },
    ]);
  });

  it('should return an empty value for a formula reading a field the role cannot read', async () => {
    const roleId = await assignNewRoleToMember('Formula hidden own field');

    await hideField({
      roleId,
      objectMetadataId: personObjectMetadataId,
      fieldName: 'jobTitle',
    });

    expect(await listPeople(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual(
      people.map(({ id }) => ({
        id,
        formulaJobShout: '',
        formulaCompanyLabel: 'Employees: 42',
        formulaAvatarMark: 'Secret avatar!',
      })),
    );
  });

  it('should return an empty value for a lookup reading a field of the related record the role cannot read', async () => {
    const roleId = await assignNewRoleToMember('Formula hidden lookup field');

    await hideField({
      roleId,
      objectMetadataId: companyObjectMetadataId,
      fieldName: 'employees',
    });

    expect(
      (await listPeople(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(
        ({ formulaCompanyLabel, formulaJobShout }) => ({
          formulaCompanyLabel,
          formulaJobShout,
        }),
      ),
    ).toEqual([
      { formulaCompanyLabel: '', formulaJobShout: 'PARIS OFFICE' },
      { formulaCompanyLabel: '', formulaJobShout: 'LONDON OFFICE' },
    ]);
  });

  it('should return an empty value for a lookup into an object the role cannot read', async () => {
    const roleId = await assignNewRoleToMember('Formula hidden lookup object');

    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: companyObjectMetadataId,
    });

    expect(
      (await listPeople(APPLE_JONY_MEMBER_ACCESS_TOKEN)).map(
        ({ formulaCompanyLabel, formulaJobShout }) => ({
          formulaCompanyLabel,
          formulaJobShout,
        }),
      ),
    ).toEqual([
      { formulaCompanyLabel: '', formulaJobShout: 'PARIS OFFICE' },
      { formulaCompanyLabel: '', formulaJobShout: 'LONDON OFFICE' },
    ]);
  });

  it('should not reveal a field a row-level rule hides on the record', async () => {
    const roleId = await assignNewRoleToMember(
      'Formula row-level hidden field',
    );
    const rowLevelPermissionPredicateGroupId = v4();

    await revokeObjectRecordsPermissions({
      roleId,
      objectMetadataId: personObjectMetadataId,
    });
    await upsertRowLevelPermissionRules({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId: personObjectMetadataId,
        rules: [
          {
            canReadRecords: true,
            canUpdateRecords: false,
            predicateGroups: [
              {
                id: rowLevelPermissionPredicateGroupId,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                predicates: [
                  {
                    id: v4(),
                    fieldMetadataId: await findFieldMetadataIdByName({
                      objectMetadataId: personObjectMetadataId,
                      fieldName: 'jobTitle',
                    }),
                    operand: RowLevelPermissionPredicateOperand.CONTAINS,
                    value: 'Paris',
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    await hideField({
      roleId,
      objectMetadataId: personObjectMetadataId,
      fieldName: 'avatarUrl',
      rowLevelPermissionPredicateGroupId,
    });
    await waitForAllJobsToFinish();

    const people = await listPeople(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(people).toEqual([
      {
        id: people[0].id,
        formulaJobShout: 'PARIS OFFICE',
        formulaCompanyLabel: 'Employees: 42',
        formulaAvatarMark: '',
      },
    ]);
    expect(JSON.stringify(people)).not.toContain('Secret avatar');
  });
});
