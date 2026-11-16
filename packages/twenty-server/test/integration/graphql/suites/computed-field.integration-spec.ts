import { isNonEmptyString } from '@sniptt/guards';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  FeatureFlagKey,
  type FieldMetadataComputation,
  FieldMetadataType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const ALPHA_PROJECT_ID = '20202020-c0f1-4000-8000-000000000001';
const BETA_PROJECT_ID = '20202020-c0f1-4000-8000-000000000002';
const EMPTY_PROJECT_ID = '20202020-c0f1-4000-8000-000000000003';

const PROJECTS = [
  { id: ALPHA_PROJECT_ID, name: 'Alpha', budget: 100 },
  { id: BETA_PROJECT_ID, name: 'Beta', budget: 30 },
  { id: EMPTY_PROJECT_ID, name: 'Empty', budget: 0 },
];

const buildTaskId = (index: number) =>
  `20202020-c0f2-4000-8000-${index.toString().padStart(12, '0')}`;

const TASKS = [
  {
    projectId: ALPHA_PROJECT_ID,
    status: 'TODO',
    points: 3,
    dueAt: '2030-03-01',
  },
  {
    projectId: ALPHA_PROJECT_ID,
    status: 'TODO',
    points: 5,
    dueAt: '2030-01-15',
  },
  {
    projectId: ALPHA_PROJECT_ID,
    status: 'DONE',
    points: 8,
    dueAt: '2029-06-01',
  },
  {
    projectId: BETA_PROJECT_ID,
    status: 'DONE',
    points: 2,
    dueAt: '2030-02-01',
  },
].map((task, index) => ({ ...task, id: buildTaskId(index + 1) }));

type ProjectNode = { id: string } & Record<string, unknown>;

describe('Computed fields (e2e)', () => {
  let projectObjectMetadataId = '';
  let taskObjectMetadataId = '';
  let projectBudgetFieldMetadataId = '';

  const createField = ({
    objectMetadataId,
    name,
    type,
    computation,
    expectToFail = false,
  }: {
    objectMetadataId: string;
    name: string;
    type: FieldMetadataType;
    computation?: FieldMetadataComputation;
    expectToFail?: boolean;
  }) =>
    createOneFieldMetadata({
      input: { objectMetadataId, name, label: name, type, computation },
      gqlFields: 'id name computation',
      expectToFail,
    });

  const findProjects = async ({
    gqlFields,
    filter,
    orderBy,
  }: {
    gqlFields: string;
    filter?: object;
    orderBy?: object;
  }): Promise<ProjectNode[]> => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'rollupProject',
        objectMetadataPluralName: 'rollupProjects',
        gqlFields: `id ${gqlFields}`,
        filter,
        orderBy,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.rollupProjects.edges.map(
      ({ node }: { node: ProjectNode }) => node,
    );
  };

  const findComputation = async ({
    objectMetadataId,
    fieldMetadataId,
  }: {
    objectMetadataId: string;
    fieldMetadataId: string;
  }): Promise<FieldMetadataComputation> => {
    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: objectMetadataId } },
        paging: { first: 100 },
      },
      gqlFields: 'id computation',
    });

    return fields.find(
      ({ node }: { node: { id: string } }) => node.id === fieldMetadataId,
    )?.node.computation;
  };

  const findBoundPaths = async (ids: {
    objectMetadataId: string;
    fieldMetadataId: string;
  }) => Object.keys((await findComputation(ids)).bindings ?? {}).sort();

  const findProjectValuesById = async (fieldName: string) =>
    Object.fromEntries(
      (await findProjects({ gqlFields: fieldName })).map((project) => [
        project.id,
        project[fieldName],
      ]),
    );

  beforeAll(async () => {
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

    projectObjectMetadataId = await createObject('rollupProject');
    taskObjectMetadataId = await createObject('rollupTask');

    await createRelationBetweenObjects({
      objectMetadataId: projectObjectMetadataId,
      targetObjectMetadataId: taskObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      name: 'tasks',
      label: 'Tasks',
      targetFieldLabel: 'Project',
    });

    await createField({
      objectMetadataId: projectObjectMetadataId,
      name: 'budget',
      type: FieldMetadataType.NUMBER,
    });

    for (const [name, type] of [
      ['status', FieldMetadataType.TEXT],
      ['points', FieldMetadataType.NUMBER],
      ['dueAt', FieldMetadataType.DATE],
    ] as const) {
      await createField({ objectMetadataId: taskObjectMetadataId, name, type });
    }

    for (const { name, type, computation } of [
      {
        name: 'taskCount',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'COUNT',
        },
      },
      {
        name: 'openTaskCount',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'COUNT',
          filter: "status != 'DONE'",
        },
      },
      {
        name: 'totalPoints',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'SUM',
          expression: 'points',
        },
      },
      {
        name: 'nextDueAt',
        type: FieldMetadataType.DATE,
        computation: {
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'MIN',
          expression: 'dueAt',
          filter: "status != 'DONE'",
        },
      },
      {
        name: 'budgetPerPoint',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'FORMULA',
          expression: 'round(budget / totalPoints, 2)',
        },
      },
      {
        name: 'budgetRemainder',
        type: FieldMetadataType.NUMBER,
        computation: { kind: 'FORMULA', expression: 'budget % 7' },
      },
      {
        name: 'isAlpha',
        type: FieldMetadataType.BOOLEAN,
        computation: {
          kind: 'FORMULA',
          expression: `id == '${ALPHA_PROJECT_ID}'`,
        },
      },
      {
        name: 'summary',
        type: FieldMetadataType.TEXT,
        computation: {
          kind: 'FORMULA',
          expression:
            "concat(upper(name), ': ', if(openTaskCount > 0, 'open', 'idle'))",
        },
      },
    ] satisfies {
      name: string;
      type: FieldMetadataType;
      computation: FieldMetadataComputation;
    }[]) {
      await createField({
        objectMetadataId: projectObjectMetadataId,
        name,
        type,
        computation,
      });
    }

    const { data: projectBudgetField } = await createField({
      objectMetadataId: taskObjectMetadataId,
      name: 'projectBudget',
      type: FieldMetadataType.NUMBER,
      computation: { kind: 'FORMULA', expression: 'project.budget' },
    });

    projectBudgetFieldMetadataId = projectBudgetField.createOneField.id;

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupProject',
        objectMetadataPluralName: 'rollupProjects',
        gqlFields: 'id',
        data: PROJECTS,
        upsert: false,
      }),
    );
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        data: TASKS,
        upsert: false,
      }),
    );
  });

  afterAll(async () => {
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

  describe('rollups', () => {
    it('counts the related records of each record', async () => {
      expect(await findProjectValuesById('taskCount')).toEqual({
        [ALPHA_PROJECT_ID]: 3,
        [BETA_PROJECT_ID]: 1,
        [EMPTY_PROJECT_ID]: 0,
      });
    });

    it('counts only the related records matching the filter', async () => {
      expect(await findProjectValuesById('openTaskCount')).toEqual({
        [ALPHA_PROJECT_ID]: 2,
        [BETA_PROJECT_ID]: 0,
        [EMPTY_PROJECT_ID]: 0,
      });
    });

    it('sums an expression of the related records', async () => {
      expect(await findProjectValuesById('totalPoints')).toEqual({
        [ALPHA_PROJECT_ID]: 16,
        [BETA_PROJECT_ID]: 2,
        [EMPTY_PROJECT_ID]: null,
      });
    });

    it('takes the earliest date among the filtered related records', async () => {
      expect(await findProjectValuesById('nextDueAt')).toEqual({
        [ALPHA_PROJECT_ID]: '2030-01-15',
        [BETA_PROJECT_ID]: null,
        [EMPTY_PROJECT_ID]: null,
      });
    });

    it('follows changes of the related records without any refresh', async () => {
      const [firstOpenTask] = TASKS;

      const setStatus = (status: string) =>
        makeGraphqlApiRequest(
          updateOneOperationFactory({
            objectMetadataSingularName: 'rollupTask',
            gqlFields: 'id',
            recordId: firstOpenTask.id,
            data: { status },
          }),
        );

      await setStatus('DONE');

      expect(
        (await findProjectValuesById('openTaskCount'))[ALPHA_PROJECT_ID],
      ).toBe(1);

      await setStatus('TODO');
    });
  });

  describe('formulas', () => {
    it('computes from stored fields and other computed fields', async () => {
      expect(await findProjectValuesById('budgetPerPoint')).toEqual({
        [ALPHA_PROJECT_ID]: 6.25,
        [BETA_PROJECT_ID]: 15,
        [EMPTY_PROJECT_ID]: null,
      });
    });

    it('supports text functions and conditions', async () => {
      expect(await findProjectValuesById('summary')).toEqual({
        [ALPHA_PROJECT_ID]: 'ALPHA: open',
        [BETA_PROJECT_ID]: 'BETA: idle',
        [EMPTY_PROJECT_ID]: 'EMPTY: idle',
      });
    });

    it('takes a remainder and compares an id to a text', async () => {
      expect(await findProjectValuesById('budgetRemainder')).toEqual({
        [ALPHA_PROJECT_ID]: 2,
        [BETA_PROJECT_ID]: 2,
        [EMPTY_PROJECT_ID]: 0,
      });
      expect(await findProjectValuesById('isAlpha')).toEqual({
        [ALPHA_PROJECT_ID]: true,
        [BETA_PROJECT_ID]: false,
        [EMPTY_PROJECT_ID]: false,
      });
    });

    it('reads a field of a to-one relation', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'rollupTask',
          objectMetadataPluralName: 'rollupTasks',
          gqlFields: 'id projectBudget',
          filter: { id: { eq: TASKS[3].id } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.rollupTasks.edges[0].node.projectBudget).toBe(
        30,
      );
    });
  });

  describe('querying', () => {
    it('filters by a computed field', async () => {
      const projects = await findProjects({
        gqlFields: 'name',
        filter: { openTaskCount: { gte: 1 } },
      });

      expect(projects.map(({ name }) => name)).toEqual(['Alpha']);
    });

    it('filters by a computed field that is not selected, combined with a stored field', async () => {
      const projects = await findProjects({
        gqlFields: 'name',
        filter: { and: [{ taskCount: { lt: 3 } }, { budget: { gt: 0 } }] },
      });

      expect(projects.map(({ name }) => name)).toEqual(['Beta']);
    });

    it('sorts by a computed field', async () => {
      const projects = await findProjects({
        gqlFields: 'name taskCount',
        orderBy: [{ taskCount: 'DescNullsLast' }],
      });

      expect(projects.map(({ name }) => name)).toEqual([
        'Alpha',
        'Beta',
        'Empty',
      ]);
    });

    it('returns computed fields of nested related records', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'rollupTask',
          objectMetadataPluralName: 'rollupTasks',
          gqlFields: 'id project { id taskCount summary }',
          filter: { id: { eq: TASKS[0].id } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.rollupTasks.edges[0].node.project).toEqual({
        id: ALPHA_PROJECT_ID,
        taskCount: 3,
        summary: 'ALPHA: open',
      });
    });

    it('returns computed fields in the response of a write', async () => {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'rollupProject',
          gqlFields: 'id budget taskCount summary',
          recordId: BETA_PROJECT_ID,
          data: { budget: 30 },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateRollupProject).toEqual({
        id: BETA_PROJECT_ID,
        budget: 30,
        taskCount: 1,
        summary: 'BETA: idle',
      });
    });

    it('updates the records matching a filter on a computed field', async () => {
      const response = await makeGraphqlApiRequest(
        updateManyOperationFactory({
          objectMetadataSingularName: 'rollupProject',
          objectMetadataPluralName: 'rollupProjects',
          gqlFields: 'name',
          filter: { taskCount: { eq: 0 } },
          data: { budget: 0 },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateRollupProjects).toEqual([
        { name: 'Empty' },
      ]);
    });

    it('refuses to write a computed field', async () => {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'rollupProject',
          gqlFields: 'id',
          recordId: ALPHA_PROJECT_ID,
          data: { taskCount: 12 },
        }),
      );

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('long names', () => {
    const DELIVERABLE_OBJECT_NAME =
      'rollupDeliverableNamedLongEnoughToOverflowAnAlias';
    const TASK_RELATION_NAME = 'taskNamedLongEnoughToOverflowAnAlias';
    const DELIVERABLE_POINTS_FIELD_NAME =
      'deliverablePointsNamedLongEnoughToOverflowAnAliasOfItsOwn';
    const DELIVERABLE_ID = '20202020-c0f3-4000-8000-000000000001';

    // Truncated to 63 bytes, the alias of a nested read would be the alias of the read around it
    it('evaluates nested to-one reads and rollups whose aliases exceed the Postgres identifier limit', async () => {
      expect(
        `${DELIVERABLE_OBJECT_NAME}_${TASK_RELATION_NAME}Id`.length,
      ).toBeGreaterThan(63);
      expect(
        `rollupTask_${DELIVERABLE_POINTS_FIELD_NAME}`.length,
      ).toBeGreaterThan(63);

      const { data: deliverableObject } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular: DELIVERABLE_OBJECT_NAME,
          namePlural: `${DELIVERABLE_OBJECT_NAME}s`,
          labelSingular: 'Long named deliverable',
          labelPlural: 'Long named deliverables',
          icon: 'IconBox',
        },
      });
      const deliverableObjectMetadataId = deliverableObject.createOneObject.id;
      let deliverablePointsFieldMetadataId = '';

      try {
        await createRelationBetweenObjects({
          objectMetadataId: deliverableObjectMetadataId,
          targetObjectMetadataId: taskObjectMetadataId,
          type: FieldMetadataType.RELATION,
          relationType: RelationType.MANY_TO_ONE,
          name: TASK_RELATION_NAME,
          label: 'Task',
          targetFieldLabel: 'Long named deliverables',
        });
        await createField({
          objectMetadataId: deliverableObjectMetadataId,
          name: 'projectBudget',
          type: FieldMetadataType.NUMBER,
          computation: {
            kind: 'FORMULA',
            expression: `${TASK_RELATION_NAME}.project.budget`,
          },
        });

        const { data: deliverablePointsField } = await createField({
          objectMetadataId: taskObjectMetadataId,
          name: DELIVERABLE_POINTS_FIELD_NAME,
          type: FieldMetadataType.NUMBER,
          computation: {
            kind: 'ROLLUP',
            relationFieldName: 'longNamedDeliverables',
            operation: 'SUM',
            expression: `${TASK_RELATION_NAME}.points`,
            filter: `${TASK_RELATION_NAME}.project.budget > 50`,
          },
        });

        deliverablePointsFieldMetadataId =
          deliverablePointsField.createOneField.id;

        const createResponse = await makeGraphqlApiRequest(
          createManyOperationFactory({
            objectMetadataSingularName: DELIVERABLE_OBJECT_NAME,
            objectMetadataPluralName: `${DELIVERABLE_OBJECT_NAME}s`,
            gqlFields: 'id projectBudget',
            data: [
              {
                id: DELIVERABLE_ID,
                [`${TASK_RELATION_NAME}Id`]: TASKS[0].id,
              },
            ],
            upsert: false,
          }),
        );

        expect(createResponse.body.errors).toBeUndefined();

        const deliverablesResponse = await makeGraphqlApiRequest(
          findManyOperationFactory({
            objectMetadataSingularName: DELIVERABLE_OBJECT_NAME,
            objectMetadataPluralName: `${DELIVERABLE_OBJECT_NAME}s`,
            gqlFields: 'id projectBudget',
          }),
        );

        expect(deliverablesResponse.body.errors).toBeUndefined();
        expect(
          deliverablesResponse.body.data[`${DELIVERABLE_OBJECT_NAME}s`].edges,
        ).toMatchObject([{ node: { id: DELIVERABLE_ID, projectBudget: 100 } }]);

        const tasksResponse = await makeGraphqlApiRequest(
          findManyOperationFactory({
            objectMetadataSingularName: 'rollupTask',
            objectMetadataPluralName: 'rollupTasks',
            gqlFields: `id ${DELIVERABLE_POINTS_FIELD_NAME}`,
            filter: { id: { in: [TASKS[0].id, TASKS[3].id] } },
          }),
        );

        expect(tasksResponse.body.errors).toBeUndefined();
        expect(
          Object.fromEntries(
            tasksResponse.body.data.rollupTasks.edges.map(
              ({ node }: { node: Record<string, unknown> }) => [
                node.id,
                node[DELIVERABLE_POINTS_FIELD_NAME],
              ],
            ),
          ),
        ).toEqual({ [TASKS[0].id]: 3, [TASKS[3].id]: null });
      } finally {
        // The rollup reads the deliverables, and a field read by a computed field cannot be deleted
        if (isNonEmptyString(deliverablePointsFieldMetadataId)) {
          await updateOneFieldMetadata({
            expectToFail: false,
            input: {
              idToUpdate: deliverablePointsFieldMetadataId,
              updatePayload: { isActive: false },
            },
          });
          await deleteOneFieldMetadata({
            expectToFail: false,
            input: { idToDelete: deliverablePointsFieldMetadataId },
          });
        }

        await updateOneObjectMetadata({
          expectToFail: false,
          input: {
            idToUpdate: deliverableObjectMetadataId,
            updatePayload: { isActive: false },
          },
        });
        await deleteOneObjectMetadata({
          expectToFail: false,
          input: { idToDelete: deliverableObjectMetadataId },
        });
      }
    });
  });

  describe('metadata validation', () => {
    const expectCreationToFail = async (
      computation: FieldMetadataComputation,
      type = FieldMetadataType.NUMBER,
    ) => {
      const { errors } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'invalidComputedField',
        type,
        computation,
        expectToFail: true,
      });

      expect(errors).toBeDefined();

      return JSON.stringify(errors);
    };

    it('rejects an expression reading an unknown field', async () => {
      expect(
        await expectCreationToFail({
          kind: 'FORMULA',
          expression: 'budget + doesNotExist',
        }),
      ).toContain('is not a field of rollupProject');
    });

    it('rejects a rollup over something that is not a one-to-many relation', async () => {
      expect(
        await expectCreationToFail({
          kind: 'ROLLUP',
          relationFieldName: 'budget',
          operation: 'COUNT',
        }),
      ).toContain('must be a stored one-to-many relation');
    });

    it('rejects a count with an expression and a sum without one', async () => {
      expect(
        await expectCreationToFail({
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'COUNT',
          expression: 'points',
        }),
      ).toContain('takes no expression');

      expect(
        await expectCreationToFail({
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'SUM',
        }),
      ).toContain('needs the expression');
    });

    it('rejects a computed field of a multi-column type', async () => {
      expect(
        await expectCreationToFail(
          { kind: 'FORMULA', expression: 'budget' },
          FieldMetadataType.CURRENCY,
        ),
      ).toContain('must be of type');
    });

    it('rejects a field that would read itself', async () => {
      expect(
        await expectCreationToFail({
          kind: 'FORMULA',
          expression: 'invalidComputedField + 1',
        }),
      ).toContain('ends up reading itself');
    });

    it('rejects turning a stored field into a computed one', async () => {
      const { data } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'storedNumber',
        type: FieldMetadataType.NUMBER,
      });

      const { errors } = await updateOneFieldMetadata({
        expectToFail: true,
        input: {
          idToUpdate: data.createOneField.id,
          updatePayload: {
            computation: { kind: 'FORMULA', expression: 'budget * 2' },
          },
        },
      });

      expect(JSON.stringify(errors)).toContain('cannot become computed');

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: data.createOneField.id,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: data.createOneField.id },
      });
    });

    it('rewrites a computed field when a field it reads is renamed, and refuses to delete that field', async () => {
      const { data } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'bonus',
        type: FieldMetadataType.NUMBER,
      });
      const bonusFieldId = data.createOneField.id;

      const {
        data: {
          createOneField: {
            id: budgetWithBonusFieldId,
            computation: createdComputation,
          },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'budgetWithBonus',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'FORMULA',
          expression: 'budget + coalesce(bonus, 0)',
          bindings: { budget: 'sent-by-the-client' },
        },
      });

      const createdBindings = createdComputation?.bindings ?? {};

      expect(Object.keys(createdBindings).sort()).toEqual(['bonus', 'budget']);
      expect(Object.values(createdBindings)).not.toContain(
        'sent-by-the-client',
      );

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: bonusFieldId,
          updatePayload: { name: 'extraBudget' },
        },
      });

      expect(
        await findComputation({
          objectMetadataId: projectObjectMetadataId,
          fieldMetadataId: budgetWithBonusFieldId,
        }),
      ).toEqual({
        kind: 'FORMULA',
        expression: 'budget + coalesce(extraBudget, 0)',
        bindings: {
          budget: createdBindings.budget,
          extraBudget: createdBindings.bonus,
        },
      });
      expect(
        (await findProjectValuesById('budgetWithBonus'))[ALPHA_PROJECT_ID],
      ).toBe(100);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: bonusFieldId, updatePayload: { isActive: false } },
      });

      const { errors: deleteErrors } = await deleteOneFieldMetadata({
        expectToFail: true,
        input: { idToDelete: bonusFieldId },
      });

      expect(JSON.stringify(deleteErrors)).toContain('would stop working');

      for (const idToDelete of [budgetWithBonusFieldId, bonusFieldId]) {
        await updateOneFieldMetadata({
          expectToFail: false,
          input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
        });
        await deleteOneFieldMetadata({
          expectToFail: false,
          input: { idToDelete },
        });
      }
    });

    it('rewrites a computed field created before the field it now reads', async () => {
      const {
        data: {
          createOneField: { id: paddedBudgetFieldId },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'paddedBudget',
        type: FieldMetadataType.NUMBER,
        computation: { kind: 'FORMULA', expression: 'budget + 1' },
      });
      const {
        data: {
          createOneField: { id: paddingFieldId },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'padding',
        type: FieldMetadataType.NUMBER,
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: paddedBudgetFieldId,
          updatePayload: {
            computation: {
              kind: 'FORMULA',
              expression: 'budget + coalesce(padding, 1)',
            },
          },
        },
      });
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: paddingFieldId,
          updatePayload: { name: 'margin' },
        },
      });

      expect(
        (await findProjectValuesById('paddedBudget'))[ALPHA_PROJECT_ID],
      ).toBe(101);

      for (const idToDelete of [paddedBudgetFieldId, paddingFieldId]) {
        await updateOneFieldMetadata({
          expectToFail: false,
          input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
        });
        await deleteOneFieldMetadata({
          expectToFail: false,
          input: { idToDelete },
        });
      }
    });

    it('rewrites the id of a relation when the relation is renamed', async () => {
      const { fields: taskFields } = await findManyFieldsMetadata({
        expectToFail: false,
        input: {
          filter: { objectMetadataId: { eq: taskObjectMetadataId } },
          paging: { first: 100 },
        },
        gqlFields: 'id name',
      });
      const projectRelationFieldId = taskFields.find(
        ({ node }: { node: { name: string } }) => node.name === 'project',
      )?.node.id;

      const {
        data: {
          createOneField: { id: isOnAlphaFieldId },
        },
      } = await createField({
        objectMetadataId: taskObjectMetadataId,
        name: 'isOnAlpha',
        type: FieldMetadataType.BOOLEAN,
        computation: {
          kind: 'FORMULA',
          expression: `project.id == '${ALPHA_PROJECT_ID}'`,
        },
      });

      const findIsOnAlpha = () =>
        findComputation({
          objectMetadataId: taskObjectMetadataId,
          fieldMetadataId: isOnAlphaFieldId,
        });

      const { bindings } = await findIsOnAlpha();

      expect(Object.keys(bindings ?? {}).sort()).toEqual([
        'project',
        'project.id',
      ]);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: projectRelationFieldId,
          updatePayload: { name: 'parentProject' },
        },
      });

      expect(await findIsOnAlpha()).toEqual({
        kind: 'FORMULA',
        expression: `parentProject.id == '${ALPHA_PROJECT_ID}'`,
        bindings: {
          parentProject: bindings?.project,
          'parentProject.id': bindings?.['project.id'],
        },
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: projectRelationFieldId,
          updatePayload: { name: 'project' },
        },
      });

      expect(await findIsOnAlpha()).toEqual({
        kind: 'FORMULA',
        expression: `project.id == '${ALPHA_PROJECT_ID}'`,
        bindings,
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: isOnAlphaFieldId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: isOnAlphaFieldId },
      });
    });

    it('rejects a relation read through its id column', async () => {
      const { errors } = await createField({
        objectMetadataId: taskObjectMetadataId,
        name: 'isOnAlphaById',
        type: FieldMetadataType.BOOLEAN,
        computation: {
          kind: 'FORMULA',
          expression: `projectId == '${ALPHA_PROJECT_ID}'`,
        },
        expectToFail: true,
      });

      expect(JSON.stringify(errors)).toContain('is not a field of rollupTask');
    });

    it('binds what a rollup reads from the relation of its own object, and follows a rename on the related object', async () => {
      const { fields: projectFields } = await findManyFieldsMetadata({
        expectToFail: false,
        input: {
          filter: { objectMetadataId: { eq: projectObjectMetadataId } },
          paging: { first: 100 },
        },
        gqlFields: 'id name',
      });
      const { fields: taskFields } = await findManyFieldsMetadata({
        expectToFail: false,
        input: {
          filter: { objectMetadataId: { eq: taskObjectMetadataId } },
          paging: { first: 100 },
        },
        gqlFields: 'id name',
      });
      const findFieldId = (
        fields: { node: { id: string; name: string } }[],
        name: string,
      ) => {
        const field = fields.find(({ node }) => node.name === name);

        assertIsDefinedOrThrow(field);

        return field.node.id;
      };

      const nextDueAt = {
        objectMetadataId: projectObjectMetadataId,
        fieldMetadataId: findFieldId(projectFields, 'nextDueAt'),
      };
      const statusFieldId = findFieldId(taskFields, 'status');

      expect(await findBoundPaths(nextDueAt)).toEqual([
        'tasks',
        'tasks.dueAt',
        'tasks.status',
      ]);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: statusFieldId, updatePayload: { name: 'stage' } },
      });

      expect(await findComputation(nextDueAt)).toMatchObject({
        relationFieldName: 'tasks',
        expression: 'dueAt',
        filter: "stage != 'DONE'",
      });
      expect(await findBoundPaths(nextDueAt)).toEqual([
        'tasks',
        'tasks.dueAt',
        'tasks.stage',
      ]);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: statusFieldId, updatePayload: { name: 'status' } },
      });

      expect(await findComputation(nextDueAt)).toMatchObject({
        filter: "status != 'DONE'",
      });
    });

    it('follows a rename and takes a new expression while the feature flag is off, but refuses a new computed field', async () => {
      const {
        data: {
          createOneField: { id: discountFieldId },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'discount',
        type: FieldMetadataType.NUMBER,
      });
      const {
        data: {
          createOneField: { id: discountedBudgetFieldId },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'discountedBudget',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'FORMULA',
          expression: 'budget - coalesce(discount, 0)',
        },
      });
      const discountedBudget = {
        objectMetadataId: projectObjectMetadataId,
        fieldMetadataId: discountedBudgetFieldId,
      };

      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_COMPUTED_FIELDS_ENABLED,
        value: false,
        expectToFail: false,
      });

      try {
        await updateOneFieldMetadata({
          expectToFail: false,
          input: {
            idToUpdate: discountFieldId,
            updatePayload: { name: 'rebate' },
          },
        });

        expect((await findComputation(discountedBudget)).expression).toBe(
          'budget - coalesce(rebate, 0)',
        );
        expect(await findBoundPaths(discountedBudget)).toEqual([
          'budget',
          'rebate',
        ]);

        await updateOneFieldMetadata({
          expectToFail: false,
          input: {
            idToUpdate: discountedBudgetFieldId,
            updatePayload: {
              computation: { kind: 'FORMULA', expression: 'budget - 1' },
            },
          },
        });

        expect((await findComputation(discountedBudget)).expression).toBe(
          'budget - 1',
        );

        const { errors } = await createField({
          objectMetadataId: projectObjectMetadataId,
          name: 'halfBudget',
          type: FieldMetadataType.NUMBER,
          computation: { kind: 'FORMULA', expression: 'budget / 2' },
          expectToFail: true,
        });

        expect(JSON.stringify(errors)).toContain(
          'computed fields are not enabled for this workspace',
        );
      } finally {
        await updateFeatureFlag({
          featureFlag: FeatureFlagKey.IS_COMPUTED_FIELDS_ENABLED,
          value: true,
          expectToFail: false,
        });
      }

      for (const idToDelete of [discountedBudgetFieldId, discountFieldId]) {
        await updateOneFieldMetadata({
          expectToFail: false,
          input: { idToUpdate: idToDelete, updatePayload: { isActive: false } },
        });
        await deleteOneFieldMetadata({
          expectToFail: false,
          input: { idToDelete },
        });
      }
    });

    it('rejects a computation whose value does not fit the type of its field', async () => {
      expect(
        await expectCreationToFail({
          kind: 'FORMULA',
          expression: "concat(name, 'x')",
        }),
      ).toContain('The computed value is text, expected number');

      expect(
        await expectCreationToFail({
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'SUM',
          expression: 'status',
        }),
      ).toContain('The expression of SUM is text, expected number');

      expect(
        await expectCreationToFail({
          kind: 'ROLLUP',
          relationFieldName: 'tasks',
          operation: 'COUNT',
          filter: 'points',
        }),
      ).toContain('The filter is number, expected boolean');
    });

    it('rejects a computation that is not shaped like one', async () => {
      expect(
        await expectCreationToFail({
          kind: 'FORMULA',
          expression: 123,
        } as unknown as FieldMetadataComputation),
      ).toContain('it must be a formula with an expression');
    });

    it('lets the expression of a computed field change', async () => {
      const { data } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'doubleBudget',
        type: FieldMetadataType.NUMBER,
        computation: { kind: 'FORMULA', expression: 'budget * 2' },
      });

      expect(
        (await findProjectValuesById('doubleBudget'))[ALPHA_PROJECT_ID],
      ).toBe(200);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: data.createOneField.id,
          updatePayload: {
            computation: { kind: 'FORMULA', expression: 'budget * 3' },
          },
        },
      });

      expect(
        (await findProjectValuesById('doubleBudget'))[ALPHA_PROJECT_ID],
      ).toBe(300);
    });
  });
});
