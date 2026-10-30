/* @license Enterprise */

import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { deleteRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path.util';
import { findRelatedRecordPaths } from 'test/integration/metadata/suites/related-record-path/utils/find-related-record-paths.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const createObject = async ({
  nameSingular,
  labelSingular,
}: {
  nameSingular: string;
  labelSingular: string;
}): Promise<string> => {
  const {
    data: {
      createOneObject: { id },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular,
      namePlural: `${nameSingular}s`,
      labelSingular,
      labelPlural: `${labelSingular}s`,
      icon: 'IconBox',
      isLabelSyncedWithName: false,
    },
  });

  return id;
};

const deleteObject = async (objectMetadataId: string) => {
  await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { isActive: false },
    },
  });
  await deleteOneObjectMetadata({
    expectToFail: false,
    input: { idToDelete: objectMetadataId },
  });
};

const findPathIds = async () =>
  (await findRelatedRecordPaths()).map(({ id }) => id);

describe('Related record path metadata', () => {
  let projectObjectMetadataId: string;
  let taskObjectMetadataId: string;
  let personObjectMetadataId: string;
  let projectTasksFieldMetadataId: string;
  let taskProjectFieldMetadataId: string;
  let taskAssigneeFieldMetadataId: string;
  let projectCodeFieldMetadataId: string;
  const createdPathIds: string[] = [];

  const createPath = async (hops: {
    firstFieldMetadataId: string;
    secondFieldMetadataId?: string;
  }) => {
    const response = await createRelatedRecordPath({
      objectMetadataId: projectObjectMetadataId,
      ...hops,
    });
    const createdPath = response.body.data?.createRelatedRecordPath;

    if (isDefined(createdPath)) {
      createdPathIds.push(createdPath.id);
    }

    return response;
  };

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const personObject = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(personObject);
    personObjectMetadataId = personObject.id;

    projectObjectMetadataId = await createObject({
      nameSingular: 'relatedPathProject',
      labelSingular: 'Related path project',
    });
    taskObjectMetadataId = await createObject({
      nameSingular: 'relatedPathTask',
      labelSingular: 'Related path task',
    });

    const projectTasksField = await createRelationBetweenObjects({
      objectMetadataId: projectObjectMetadataId,
      targetObjectMetadataId: taskObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      name: 'tasks',
      label: 'Tasks',
      targetFieldLabel: 'Project',
      targetFieldIcon: 'IconBox',
    });

    projectTasksFieldMetadataId = projectTasksField.id;
    taskProjectFieldMetadataId =
      projectTasksField.relation.targetFieldMetadata.id;

    const taskAssigneeField = await createRelationBetweenObjects({
      objectMetadataId: taskObjectMetadataId,
      targetObjectMetadataId: personObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'assignee',
      label: 'Assignee',
      targetFieldLabel: 'Related path tasks',
      targetFieldIcon: 'IconBox',
    });

    taskAssigneeFieldMetadataId = taskAssigneeField.id;

    const {
      data: {
        createOneField: { id: projectCodeFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: projectObjectMetadataId,
        name: 'code',
        label: 'Code',
        type: FieldMetadataType.TEXT,
      },
      gqlFields: 'id',
    });

    projectCodeFieldMetadataId = projectCodeFieldId;
  });

  afterAll(async () => {
    try {
      const remainingPathIds = await findPathIds();

      for (const pathId of createdPathIds) {
        if (remainingPathIds.includes(pathId)) {
          await deleteRelatedRecordPath(pathId);
        }
      }

      await deleteObject(projectObjectMetadataId);
      await deleteObject(taskObjectMetadataId);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should create, list and delete a two hop path', async () => {
    const response = await createPath({
      firstFieldMetadataId: projectTasksFieldMetadataId,
      secondFieldMetadataId: taskAssigneeFieldMetadataId,
    });

    expect(response.body.errors).toBeUndefined();

    const createdPath = response.body.data.createRelatedRecordPath;

    expect(createdPath).toMatchObject({
      objectMetadataId: projectObjectMetadataId,
      firstFieldMetadataId: projectTasksFieldMetadataId,
      secondFieldMetadataId: taskAssigneeFieldMetadataId,
      thirdFieldMetadataId: null,
    });
    expect(await findPathIds()).toContain(createdPath.id);

    const deleteResponse = await deleteRelatedRecordPath(createdPath.id);

    expect(deleteResponse.body.data.deleteRelatedRecordPath.id).toBe(
      createdPath.id,
    );
    expect(await findPathIds()).not.toContain(createdPath.id);
  });

  it('should reject a path that already exists', async () => {
    const firstResponse = await createPath({
      firstFieldMetadataId: projectTasksFieldMetadataId,
    });

    expect(firstResponse.body.errors).toBeUndefined();

    const secondResponse = await createPath({
      firstFieldMetadataId: projectTasksFieldMetadataId,
    });

    expect(JSON.stringify(secondResponse.body.errors)).toContain(
      'This related record path already exists',
    );
  });

  it('should save only one of two identical paths created at the same time', async () => {
    const responses = await Promise.all([
      createPath({
        firstFieldMetadataId: projectTasksFieldMetadataId,
        secondFieldMetadataId: taskAssigneeFieldMetadataId,
      }),
      createPath({
        firstFieldMetadataId: projectTasksFieldMetadataId,
        secondFieldMetadataId: taskAssigneeFieldMetadataId,
      }),
    ]);

    expect(
      responses.filter((response) =>
        isDefined(response.body.data?.createRelatedRecordPath),
      ),
    ).toHaveLength(1);

    const createdPath = responses.find((response) =>
      isDefined(response.body.data?.createRelatedRecordPath),
    )?.body.data.createRelatedRecordPath;

    jestExpectToBeDefined(createdPath);
    await deleteRelatedRecordPath(createdPath.id);
  });

  it('should reject a path that comes back to an object it already visited', async () => {
    const response = await createPath({
      firstFieldMetadataId: projectTasksFieldMetadataId,
      secondFieldMetadataId: taskProjectFieldMetadataId,
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'Related record path cannot visit the same object twice',
    );
  });

  it('should reject a field that does not belong to the object reached so far', async () => {
    const response = await createPath({
      firstFieldMetadataId: taskAssigneeFieldMetadataId,
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'Each related record path field must belong to the object reached by the previous relation',
    );
  });

  it('should reject a field that is not a relation', async () => {
    const response = await createPath({
      firstFieldMetadataId: projectCodeFieldMetadataId,
    });

    expect(JSON.stringify(response.body.errors)).toContain(
      'Related record path fields must be relations',
    );
  });

  it('should reject an object or field that does not exist', async () => {
    const unknownObjectResponse = await createRelatedRecordPath({
      objectMetadataId: v4(),
      firstFieldMetadataId: projectTasksFieldMetadataId,
    });

    expect(JSON.stringify(unknownObjectResponse.body.errors)).toContain(
      'Related record path object not found',
    );

    const unknownFieldResponse = await createPath({
      firstFieldMetadataId: v4(),
    });

    expect(JSON.stringify(unknownFieldResponse.body.errors)).toContain(
      'Related record path field not found',
    );
  });
});
