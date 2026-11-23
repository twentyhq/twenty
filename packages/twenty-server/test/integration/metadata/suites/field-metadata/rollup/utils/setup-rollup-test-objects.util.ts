import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

export type RollupTestObjects = {
  projectObjectMetadataId: string;
  taskObjectMetadataId: string;
  tasksRelationFieldMetadataId: string;
  projectRelationFieldMetadataId: string;
  taskFieldMetadataIdByName: Record<
    'estimate' | 'dueAt' | 'startsOn' | 'isDone' | 'title',
    string
  >;
};

const createTaskField = async ({
  taskObjectMetadataId,
  name,
  type,
}: {
  taskObjectMetadataId: string;
  name: string;
  type: FieldMetadataType;
}) => {
  const { data } = await createOneFieldMetadata({
    expectToFail: false,
    input: {
      objectMetadataId: taskObjectMetadataId,
      name,
      label: name,
      type,
    },
    gqlFields: 'id',
  });

  return data.createOneField.id;
};

export const setupRollupTestObjects = async (): Promise<RollupTestObjects> => {
  const {
    data: {
      createOneObject: { id: projectObjectMetadataId },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular: 'rollupProject',
      namePlural: 'rollupProjects',
      labelSingular: 'Rollup project',
      labelPlural: 'Rollup projects',
      icon: 'IconFolder',
    },
  });

  const {
    data: {
      createOneObject: { id: taskObjectMetadataId },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular: 'rollupTask',
      namePlural: 'rollupTasks',
      labelSingular: 'Rollup task',
      labelPlural: 'Rollup tasks',
      icon: 'IconCheckbox',
    },
  });

  const tasksRelationField = await createRelationBetweenObjects({
    objectMetadataId: projectObjectMetadataId,
    targetObjectMetadataId: taskObjectMetadataId,
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
    name: 'tasks',
    label: 'Tasks',
    targetFieldLabel: 'Project',
    targetFieldIcon: 'IconFolder',
  });

  const projectRelationFieldMetadataId =
    tasksRelationField.relation.targetFieldMetadata.id;

  jestExpectToBeDefined(projectRelationFieldMetadataId);

  return {
    projectObjectMetadataId,
    taskObjectMetadataId,
    tasksRelationFieldMetadataId: tasksRelationField.id,
    projectRelationFieldMetadataId,
    taskFieldMetadataIdByName: {
      estimate: await createTaskField({
        taskObjectMetadataId,
        name: 'estimate',
        type: FieldMetadataType.NUMBER,
      }),
      dueAt: await createTaskField({
        taskObjectMetadataId,
        name: 'dueAt',
        type: FieldMetadataType.DATE_TIME,
      }),
      startsOn: await createTaskField({
        taskObjectMetadataId,
        name: 'startsOn',
        type: FieldMetadataType.DATE,
      }),
      isDone: await createTaskField({
        taskObjectMetadataId,
        name: 'isDone',
        type: FieldMetadataType.BOOLEAN,
      }),
      title: await createTaskField({
        taskObjectMetadataId,
        name: 'title',
        type: FieldMetadataType.TEXT,
      }),
    },
  };
};
