import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type ListedMorphField = {
  id: string;
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  morphRelations: { targetObjectMetadata: { id: string } }[];
};

const setMorphFieldGroupEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_MORPH_FIELD_GROUP_ENABLED,
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

describe('morph field group', () => {
  let sourceObjectMetadataId = '';
  let firstTargetObjectMetadataId = '';
  let secondTargetObjectMetadataId = '';
  let thirdTargetObjectMetadataId = '';
  let targetFieldIds: string[] = [];

  beforeEach(async () => {
    sourceObjectMetadataId = await createObject('groupSource', 'groupSources');
    firstTargetObjectMetadataId = await createObject(
      'groupTargetOne',
      'groupTargetOnes',
    );
    secondTargetObjectMetadataId = await createObject(
      'groupTargetTwo',
      'groupTargetTwos',
    );
    thirdTargetObjectMetadataId = await createObject(
      'groupTargetThree',
      'groupTargetThrees',
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
    await setMorphFieldGroupEnabled(false);

    for (const objectMetadataId of [
      sourceObjectMetadataId,
      firstTargetObjectMetadataId,
      secondTargetObjectMetadataId,
      thirdTargetObjectMetadataId,
    ]) {
      await deleteObject(objectMetadataId);
    }
  });

  it('should keep exposing a target until morph field groups are enabled', async () => {
    const [survivor] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(survivor.name).toBe('owner');
    expect(targetFieldIds).toContain(survivor.id);

    await setMorphFieldGroupEnabled(true);

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

  it('should add destinations through the group', async () => {
    await setMorphFieldGroupEnabled(true);

    const [group] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: group.id,
        updatePayload: {
          morphRelationsUpdatePayload: [
            { targetObjectMetadataId: thirdTargetObjectMetadataId },
          ],
        },
      },
    });

    const [updatedGroup] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(updatedGroup.id).toBe(group.id);
    expect(updatedGroup.morphRelations).toHaveLength(3);
  });

  it('should keep the group when a destination object is deleted', async () => {
    await setMorphFieldGroupEnabled(true);

    const [group] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await deleteObject(secondTargetObjectMetadataId);
    secondTargetObjectMetadataId = await createObject(
      'groupTargetTwo',
      'groupTargetTwos',
    );

    const [groupAfterDeletion] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    expect(groupAfterDeletion.id).toBe(group.id);
    expect(
      groupAfterDeletion.morphRelations.map(
        (morphRelation) => morphRelation.targetObjectMetadata.id,
      ),
    ).toEqual([firstTargetObjectMetadataId]);
  });

  it('should delete the group with its morph field', async () => {
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

    await setMorphFieldGroupEnabled(true);

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);
  });

  it('should delete the morph field through its group', async () => {
    await setMorphFieldGroupEnabled(true);

    const [group] = await findMorphFieldsOfObject({
      id: { eq: sourceObjectMetadataId },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: group.id,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      input: { idToDelete: group.id },
      expectToFail: false,
    });

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);

    await setMorphFieldGroupEnabled(false);

    expect(
      await findMorphFieldsOfObject({ id: { eq: sourceObjectMetadataId } }),
    ).toEqual([]);
  });

  it('should expose the standard group of note targets', async () => {
    await setMorphFieldGroupEnabled(true);

    const morphFields = await findMorphFieldsOfObject({
      universalIdentifier: {
        eq: STANDARD_OBJECTS.noteTarget.universalIdentifier,
      },
    });

    expect(morphFields).toHaveLength(1);
    expect(morphFields[0]).toMatchObject({
      name: 'target',
      universalIdentifier:
        STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
    });
    expect(morphFields[0].morphRelations.length).toBeGreaterThan(1);
  });
});
