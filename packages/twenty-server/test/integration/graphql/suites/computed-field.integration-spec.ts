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
import {
  type FieldMetadataComputation,
  FieldMetadataType,
} from 'twenty-shared/types';

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

    await createField({
      objectMetadataId: projectObjectMetadataId,
      name: 'upcomingTasks',
      type: FieldMetadataType.RELATION,
      computation: {
        kind: 'FILTERED_RELATION',
        relationFieldName: 'tasks',
        filter: "status != 'DONE' and dueAt >= '2030-01-01'",
        orderBy: [{ dueAt: 'AscNullsLast' }],
        limit: 1,
      },
    });

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

  describe('filtered relations', () => {
    const findUpcomingTasksByProjectId = async (selection: string) =>
      Object.fromEntries(
        (
          await findProjects({
            gqlFields: `${selection} { totalCount edges { node { id dueAt } } }`,
          })
        ).map((project) => [project.id, project.upcomingTasks]),
      );

    it('returns the filtered, sorted and limited related records of each record', async () => {
      const upcomingTasksByProjectId =
        await findUpcomingTasksByProjectId('upcomingTasks');

      expect(upcomingTasksByProjectId[ALPHA_PROJECT_ID]).toEqual({
        totalCount: 2,
        edges: [{ node: { id: TASKS[1].id, dueAt: '2030-01-15' } }],
      });
      expect(upcomingTasksByProjectId[BETA_PROJECT_ID]).toEqual({
        totalCount: 0,
        edges: [],
      });
    });

    it('lets a query narrow the relation further but not widen it', async () => {
      const narrowed = await findUpcomingTasksByProjectId(
        'upcomingTasks(filter: { points: { eq: 3 } }, first: 10)',
      );

      expect(narrowed[ALPHA_PROJECT_ID]).toMatchObject({
        totalCount: 1,
        edges: [{ node: { id: TASKS[0].id, dueAt: '2030-03-01' } }],
      });
    });

    it('rejects a sort by an unknown field or direction, and follows the renaming of its sort field', async () => {
      for (const orderBy of [
        [{ missingField: 'AscNullsLast' }],
        [{ dueAt: 'Upwards' }],
      ]) {
        const { errors } = await createField({
          objectMetadataId: projectObjectMetadataId,
          name: 'sortedTasks',
          type: FieldMetadataType.RELATION,
          computation: {
            kind: 'FILTERED_RELATION',
            relationFieldName: 'tasks',
            orderBy,
          } as FieldMetadataComputation,
          expectToFail: true,
        });

        expect(JSON.stringify(errors)).toContain('Invalid computation');
      }

      const findField = async (objectMetadataId: string, name: string) =>
        (
          await findManyFieldsMetadata({
            expectToFail: false,
            input: {
              filter: { objectMetadataId: { eq: objectMetadataId } },
              paging: { first: 100 },
            },
            gqlFields: 'id name computation',
          })
        ).fields.find(
          ({ node }: { node: { name: string } }) => node.name === name,
        )?.node;
      const findUpcomingTasksOrderBy = async () =>
        (await findField(projectObjectMetadataId, 'upcomingTasks')).computation
          .orderBy;

      const { id: dueAtFieldId } = await findField(
        taskObjectMetadataId,
        'dueAt',
      );

      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: dueAtFieldId, updatePayload: { name: 'dueOn' } },
      });

      expect(await findUpcomingTasksOrderBy()).toEqual([
        { dueOn: 'AscNullsLast' },
      ]);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: { idToUpdate: dueAtFieldId, updatePayload: { name: 'dueAt' } },
      });

      expect(await findUpcomingTasksOrderBy()).toEqual([
        { dueAt: 'AscNullsLast' },
      ]);
    });

    it('leaves the relation it derives from untouched', async () => {
      const [alphaProject] = await findProjects({
        gqlFields: 'tasks { totalCount }',
        filter: { id: { eq: ALPHA_PROJECT_ID } },
      });

      expect(alphaProject.tasks).toEqual({ totalCount: 3 });
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
      ).toContain('is not a field of rollupProject');
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
          createOneField: { id: budgetWithBonusFieldId },
        },
      } = await createField({
        objectMetadataId: projectObjectMetadataId,
        name: 'budgetWithBonus',
        type: FieldMetadataType.NUMBER,
        computation: {
          kind: 'FORMULA',
          expression: 'budget + coalesce(bonus, 0)',
        },
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: bonusFieldId,
          updatePayload: { name: 'extraBudget' },
        },
      });

      const { fields } = await findManyFieldsMetadata({
        expectToFail: false,
        input: {
          filter: { objectMetadataId: { eq: projectObjectMetadataId } },
          paging: { first: 100 },
        },
        gqlFields: 'id computation',
      });

      expect(
        fields.find(
          ({ node }: { node: { id: string } }) =>
            node.id === budgetWithBonusFieldId,
        )?.node.computation,
      ).toEqual({
        kind: 'FORMULA',
        expression: 'budget + coalesce(extraBudget, 0)',
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
          expression: `projectId == '${ALPHA_PROJECT_ID}'`,
        },
      });

      const findIsOnAlphaExpression = async () => {
        const { fields } = await findManyFieldsMetadata({
          expectToFail: false,
          input: {
            filter: { objectMetadataId: { eq: taskObjectMetadataId } },
            paging: { first: 100 },
          },
          gqlFields: 'id computation',
        });

        return fields.find(
          ({ node }: { node: { id: string } }) => node.id === isOnAlphaFieldId,
        )?.node.computation.expression;
      };

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: projectRelationFieldId,
          updatePayload: { name: 'parentProject' },
        },
      });

      expect(await findIsOnAlphaExpression()).toBe(
        `parentProjectId == '${ALPHA_PROJECT_ID}'`,
      );

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: projectRelationFieldId,
          updatePayload: { name: 'project' },
        },
      });

      expect(await findIsOnAlphaExpression()).toBe(
        `projectId == '${ALPHA_PROJECT_ID}'`,
      );

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
