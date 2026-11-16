import { isNonEmptyString } from '@sniptt/guards';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { upsertFieldPermissions } from 'test/integration/graphql/utils/upsert-field-permissions.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import {
  type FieldMetadataComputation,
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const PROJECT_ID = '20202020-c0f3-4000-8000-000000000001';
const SMALL_TASK_ID = '20202020-c0f4-4000-8000-000000000001';
const BIG_TASK_ID = '20202020-c0f4-4000-8000-000000000002';

const PROJECTS = [{ id: PROJECT_ID, name: 'Alpha', budget: 100 }];

const TASKS = [
  {
    id: SMALL_TASK_ID,
    projectId: PROJECT_ID,
    status: 'TODO',
    points: 3,
    dueAt: '2030-03-01',
  },
  {
    id: BIG_TASK_ID,
    projectId: PROJECT_ID,
    status: 'TODO',
    points: 5,
    dueAt: '2030-01-15',
  },
];

const PROJECT_COMPUTED_FIELDS = [
  {
    name: 'doubleBudget',
    computation: { kind: 'FORMULA', expression: 'budget * 2' },
  },
  {
    name: 'taskCount',
    computation: {
      kind: 'ROLLUP',
      relationFieldName: 'tasks',
      operation: 'COUNT',
    },
  },
  {
    name: 'totalPoints',
    computation: {
      kind: 'ROLLUP',
      relationFieldName: 'tasks',
      operation: 'SUM',
      expression: 'points',
    },
  },
  {
    name: 'bigTaskCount',
    computation: {
      kind: 'ROLLUP',
      relationFieldName: 'tasks',
      operation: 'COUNT',
      filter: 'points > 4',
    },
  },
] satisfies { name: string; computation: FieldMetadataComputation }[];

const PROJECT_COMPUTED_GQL_FIELDS = PROJECT_COMPUTED_FIELDS.map(
  ({ name }) => name,
).join(' ');

type RecordNode = { id: string } & Record<string, unknown>;

describe('Computed field permissions (e2e)', () => {
  let projectObjectMetadataId = '';
  let taskObjectMetadataId = '';
  let budgetFieldMetadataId = '';
  let pointsFieldMetadataId = '';
  let projectBudgetFieldMetadataId = '';
  let originalMemberRoleId = '';
  let customRoleId = '';

  const createField = async ({
    objectMetadataId,
    name,
    type,
    computation,
  }: {
    objectMetadataId: string;
    name: string;
    type: FieldMetadataType;
    computation?: FieldMetadataComputation;
  }): Promise<string> => {
    const { data } = await createOneFieldMetadata({
      input: { objectMetadataId, name, label: name, type, computation },
      gqlFields: 'id name computation',
      expectToFail: false,
    });

    return data.createOneField.id;
  };

  const findOneAsMember = async ({
    objectMetadataSingularName,
    recordId,
    gqlFields,
  }: {
    objectMetadataSingularName: 'permProject' | 'permTask';
    recordId: string;
    gqlFields: string;
  }): Promise<RecordNode> => {
    const objectMetadataPluralName = `${objectMetadataSingularName}s`;

    const response = await makeGraphqlApiRequestWithMemberRole(
      findManyOperationFactory({
        objectMetadataSingularName,
        objectMetadataPluralName,
        gqlFields: `id ${gqlFields}`,
        filter: { id: { eq: recordId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const { edges } = response.body.data[objectMetadataPluralName];

    expect(edges).toHaveLength(1);

    return edges[0].node;
  };

  const findProjectAsMember = () =>
    findOneAsMember({
      objectMetadataSingularName: 'permProject',
      recordId: PROJECT_ID,
      gqlFields: PROJECT_COMPUTED_GQL_FIELDS,
    });

  const findTaskAsMember = () =>
    findOneAsMember({
      objectMetadataSingularName: 'permTask',
      recordId: SMALL_TASK_ID,
      gqlFields: 'projectBudget',
    });

  const setFieldReadable = async ({
    objectMetadataId,
    fieldMetadataId,
    isReadable,
  }: {
    objectMetadataId: string;
    fieldMetadataId: string;
    isReadable: boolean;
  }) => {
    // Field permissions can only restrict: clearing both flags removes the restriction
    const restriction = isReadable ? null : false;

    const { errors } = await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId,
          fieldMetadataId,
          canReadFieldValue: restriction,
          canUpdateFieldValue: restriction,
        },
      ],
    });

    expect(errors).toBeUndefined();
  };

  const setTaskObjectReadable = async (isReadable: boolean) => {
    const { errors } = await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        objectPermissions: [
          {
            objectMetadataId: taskObjectMetadataId,
            canReadObjectRecords: isReadable,
            canUpdateObjectRecords: isReadable,
            canSoftDeleteObjectRecords: isReadable,
            canDestroyObjectRecords: isReadable,
          },
        ],
      },
    });

    expect(errors).toBeUndefined();
  };

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const createObject = async (nameSingular: string) => {
      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular,
          namePlural: `${nameSingular}s`,
          labelSingular: nameSingular,
          labelPlural: `${nameSingular}s`,
          icon: 'IconBox',
        },
      });

      return data.createOneObject.id;
    };

    projectObjectMetadataId = await createObject('permProject');
    taskObjectMetadataId = await createObject('permTask');

    await createRelationBetweenObjects({
      objectMetadataId: projectObjectMetadataId,
      targetObjectMetadataId: taskObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      name: 'tasks',
      label: 'Tasks',
      targetFieldLabel: 'Project',
    });

    budgetFieldMetadataId = await createField({
      objectMetadataId: projectObjectMetadataId,
      name: 'budget',
      type: FieldMetadataType.NUMBER,
    });

    await createField({
      objectMetadataId: taskObjectMetadataId,
      name: 'status',
      type: FieldMetadataType.TEXT,
    });
    pointsFieldMetadataId = await createField({
      objectMetadataId: taskObjectMetadataId,
      name: 'points',
      type: FieldMetadataType.NUMBER,
    });
    await createField({
      objectMetadataId: taskObjectMetadataId,
      name: 'dueAt',
      type: FieldMetadataType.DATE,
    });

    for (const { name, computation } of PROJECT_COMPUTED_FIELDS) {
      await createField({
        objectMetadataId: projectObjectMetadataId,
        name,
        type: FieldMetadataType.NUMBER,
        computation,
      });
    }

    projectBudgetFieldMetadataId = await createField({
      objectMetadataId: taskObjectMetadataId,
      name: 'projectBudget',
      type: FieldMetadataType.NUMBER,
      computation: { kind: 'FORMULA', expression: 'project.budget' },
    });

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'permProject',
        objectMetadataPluralName: 'permProjects',
        gqlFields: 'id',
        data: PROJECTS,
        upsert: false,
      }),
    );
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'permTask',
        objectMetadataPluralName: 'permTasks',
        gqlFields: 'id',
        data: TASKS,
        upsert: false,
      }),
    );

    // Without object-specific options the role reads every object, including both custom ones
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'ComputedFieldPermissionsRole',
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterEach(async () => {
    await setTaskObjectReadable(true);
    await setFieldReadable({
      objectMetadataId: projectObjectMetadataId,
      fieldMetadataId: budgetFieldMetadataId,
      isReadable: true,
    });
    await setFieldReadable({
      objectMetadataId: taskObjectMetadataId,
      fieldMetadataId: pointsFieldMetadataId,
      isReadable: true,
    });
  });

  afterAll(async () => {
    if (isNonEmptyString(originalMemberRoleId)) {
      await updateWorkspaceMemberRole({
        client,
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });
    }

    if (isNonEmptyString(customRoleId)) {
      await deleteRole(client, customRoleId);
    }

    // Each object has a computed field reading the other, and a field read by a computed field cannot be deleted
    if (isNonEmptyString(projectBudgetFieldMetadataId)) {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: projectBudgetFieldMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: projectBudgetFieldMetadataId },
      });
    }

    for (const idToUpdate of [
      projectObjectMetadataId,
      taskObjectMetadataId,
    ].filter(isNonEmptyString)) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: { idToUpdate, updatePayload: { isActive: false } },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: idToUpdate },
      });
    }
  });

  it('returns every computed value to a member who can read everything they depend on', async () => {
    expect(await findProjectAsMember()).toEqual({
      id: PROJECT_ID,
      doubleBudget: 200,
      taskCount: 2,
      totalPoints: 8,
      bigTaskCount: 1,
    });
    expect((await findTaskAsMember()).projectBudget).toBe(100);
  });

  it('nulls the formulas reading a field the member cannot read, on the record and through a to-one relation', async () => {
    await setFieldReadable({
      objectMetadataId: projectObjectMetadataId,
      fieldMetadataId: budgetFieldMetadataId,
      isReadable: false,
    });

    expect(await findProjectAsMember()).toEqual({
      id: PROJECT_ID,
      doubleBudget: null,
      taskCount: 2,
      totalPoints: 8,
      bigTaskCount: 1,
    });
    expect((await findTaskAsMember()).projectBudget).toBeNull();
  });

  it('nulls the rollups whose expression or filter reads a related field the member cannot read', async () => {
    await setFieldReadable({
      objectMetadataId: taskObjectMetadataId,
      fieldMetadataId: pointsFieldMetadataId,
      isReadable: false,
    });

    expect(await findProjectAsMember()).toEqual({
      id: PROJECT_ID,
      doubleBudget: 200,
      taskCount: 2,
      totalPoints: null,
      bigTaskCount: null,
    });
  });

  it('nulls every rollup over an object the member cannot read', async () => {
    await setTaskObjectReadable(false);

    expect(await findProjectAsMember()).toEqual({
      id: PROJECT_ID,
      doubleBudget: 200,
      taskCount: null,
      totalPoints: null,
      bigTaskCount: null,
    });
  });

  it('reads a field that a row-level rule hides on a record as empty on that record', async () => {
    const [{ id: nameFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'name'`,
      [projectObjectMetadataId],
    );
    const ruleId = v4();

    await revokeObjectRecordsPermissions({
      roleId: customRoleId,
      objectMetadataId: projectObjectMetadataId,
    });
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: customRoleId,
        objectMetadataId: projectObjectMetadataId,
        canReadRecords: true,
        predicateGroups: [
          {
            id: ruleId,
            objectMetadataId: projectObjectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId: nameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Alpha',
            rowLevelPermissionPredicateGroupId: ruleId,
          },
        ],
      },
    });

    const { errors } = await upsertFieldPermissions({
      roleId: customRoleId,
      fieldPermissions: [
        {
          objectMetadataId: projectObjectMetadataId,
          fieldMetadataId: budgetFieldMetadataId,
          rowLevelPermissionPredicateGroupId: ruleId,
          canReadFieldValue: false,
        },
      ],
    });

    expect(errors).toBeUndefined();

    expect(await findProjectAsMember()).toEqual({
      id: PROJECT_ID,
      doubleBudget: null,
      taskCount: 2,
      totalPoints: 8,
      bigTaskCount: 1,
    });
    expect((await findTaskAsMember()).projectBudget).toBeNull();
  });
});
