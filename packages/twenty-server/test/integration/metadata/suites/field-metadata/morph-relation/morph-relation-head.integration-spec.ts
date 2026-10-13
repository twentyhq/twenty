import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type ListedMorphField = {
  id: string;
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  morphRelations: { targetObjectMetadata: { id: string } }[];
};

const setMorphRelationHeadEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_MORPH_RELATION_HEAD_ENABLED,
    value,
    expectToFail: false,
  });

const findMorphFieldsOfObject = async (
  objectFilter: object,
): Promise<ListedMorphField[]> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: objectFilter, paging: { first: 1 } },
    gqlFields: `
      id
      fieldsList {
        id
        name
        type
        universalIdentifier
        morphRelations {
          targetObjectMetadata {
            id
          }
        }
      }
    `,
    expectToFail: false,
  });

  return (
    (objects[0]?.fieldsList ?? []) as unknown as ListedMorphField[]
  ).filter((field) => field.type === FieldMetadataType.MORPH_RELATION);
};

const createObject = async (nameSingular: string, namePlural: string) => {
  const {
    data: {
      createOneObject: { id },
    },
  } = await createOneObjectMetadata({
    input: {
      nameSingular,
      namePlural,
      labelSingular: nameSingular,
      labelPlural: namePlural,
      icon: 'IconBox',
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
    input: { idToDelete: objectMetadataId },
  });
};

describe('morph relation head', () => {
  let sourceObjectMetadataId = '';
  let firstTargetObjectMetadataId = '';
  let secondTargetObjectMetadataId = '';
  let thirdTargetObjectMetadataId = '';
  let targetFieldIds: string[] = [];

  beforeEach(async () => {
    sourceObjectMetadataId = await createObject('headSource', 'headSources');
    firstTargetObjectMetadataId = await createObject(
      'headTargetOne',
      'headTargetOnes',
    );
    secondTargetObjectMetadataId = await createObject(
      'headTargetTwo',
      'headTargetTwos',
    );
    thirdTargetObjectMetadataId = await createObject(
      'headTargetThree',
      'headTargetThrees',
    );

    const createdField = await createMorphRelationBetweenObjects({
      objectMetadataId: sourceObjectMetadataId,
      firstTargetObjectMetadataId,
      secondTargetObjectMetadataId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });

    targetFieldIds = createdField.morphRelations.map(
      (morphRelation) => morphRelation.sourceFieldMetadata.id,
    );
  });

  afterEach(async () => {
    await setMorphRelationHeadEnabled(false);

    for (const objectMetadataId of [
      sourceObjectMetadataId,
      firstTargetObjectMetadataId,
      secondTargetObjectMetadataId,
      thirdTargetObjectMetadataId,
    ].filter(Boolean)) {
      await deleteObject(objectMetadataId);
    }
  });

  it('should keep exposing a target until morph relation heads are enabled', async () => {
    const [survivor] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(survivor.name).toBe('owner');
    expect(targetFieldIds).toContain(survivor.id);

    await setMorphRelationHeadEnabled(true);

    const morphFields = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(morphFields).toHaveLength(1);
    expect(morphFields[0].name).toBe('owner');
    expect(targetFieldIds).not.toContain(morphFields[0].id);
    expect(
      morphFields[0].morphRelations
        .map((morphRelation) => morphRelation.targetObjectMetadata.id)
        .sort(),
    ).toEqual(
      [firstTargetObjectMetadataId, secondTargetObjectMetadataId].sort(),
    );
  });

  it('should add destinations through the head', async () => {
    await setMorphRelationHeadEnabled(true);

    const [head] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: head.id,
        updatePayload: {
          morphRelationsUpdatePayload: [
            { targetObjectMetadataId: thirdTargetObjectMetadataId },
          ],
        },
      },
    });

    const [updatedHead] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(updatedHead.id).toBe(head.id);
    expect(updatedHead.morphRelations).toHaveLength(3);
  });

  it('should keep the head when a destination object is deleted', async () => {
    await setMorphRelationHeadEnabled(true);

    const [head] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await deleteObject(secondTargetObjectMetadataId);
    secondTargetObjectMetadataId = '';

    const [headAfterDeletion] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(headAfterDeletion.id).toBe(head.id);
    expect(
      headAfterDeletion.morphRelations.map(
        (morphRelation) => morphRelation.targetObjectMetadata.id,
      ),
    ).toEqual([firstTargetObjectMetadataId]);
  });

  it('should delete the head with its morph field', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: targetFieldIds[0],
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      input: { idToDelete: targetFieldIds[0] },
      expectToFail: false,
    });

    await setMorphRelationHeadEnabled(true);

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);
  });

  it('should delete the morph field through its head', async () => {
    await setMorphRelationHeadEnabled(true);

    const [head] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: head.id,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      input: { idToDelete: head.id },
      expectToFail: false,
    });

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);

    await setMorphRelationHeadEnabled(false);

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);
  });
});
