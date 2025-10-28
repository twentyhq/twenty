import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { CUSTOM_OBJECT_FOOD } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-food.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

describe('Index metadata creation on relation field creation v2', () => {
  let createdObjectId: string;
  let secondCreatedObjectId: string;

  beforeEach(async () => {
    const {
      labelPlural,
      description,
      labelSingular,
      namePlural,
      nameSingular,
    } = CUSTOM_OBJECT_DISHES;

    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        labelPlural,
        description,
        labelSingular,
        namePlural,
        nameSingular,
        icon: 'IconTest',
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
      `,
    });

    createdObjectId = data.createOneObject.id;

    {
      const {
        labelPlural,
        description,
        labelSingular,
        namePlural,
        nameSingular,
      } = CUSTOM_OBJECT_FOOD;
      const { data: secondData } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelPlural,
          description,
          labelSingular,
          namePlural,
          nameSingular,
          icon: 'IconTest',
          isLabelSyncedWithName: false,
        },
        gqlFields: `
        id
      `,
      });

      secondCreatedObjectId = secondData.createOneObject.id;
    }
  });

  afterEach(async () => {
    for (const objectMetadataId of [createdObjectId, secondCreatedObjectId]) {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
        expectToFail: false,
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }
  });

  it('Should create and delete index on MANY_TO_ONE relation field creation and deletion', async () => {
    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'relationField',
        type: FieldMetadataType.RELATION,
        label: 'relation field',
        objectMetadataId: createdObjectId,
        relationCreationPayload: {
          type: RelationType.MANY_TO_ONE,
          targetFieldIcon: '123Icon',
          targetFieldLabel: 'whatever',
          targetObjectMetadataId: secondCreatedObjectId,
        },
      },
    });

    let objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const dishObject = objects.find((obj) => obj.id === createdObjectId);
    const foodObject = objects.find((obj) => obj.id === secondCreatedObjectId);

    jestExpectToBeDefined(dishObject);
    jestExpectToBeDefined(foodObject);

    const dishRelationField = dishObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.name === 'relationField',
    );

    jestExpectToBeDefined(dishRelationField?.relation);
    expect(dishRelationField.relation.targetObjectMetadata.id).toBe(
      secondCreatedObjectId,
    );

    const foodRelationField = foodObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.id === dishRelationField.relation?.targetFieldMetadata.id,
    );

    jestExpectToBeDefined(foodRelationField);

    const dishRelationFieldIndex = dishObject.indexMetadataList.find((index) =>
      index.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === dishRelationField.id,
      ),
    );

    jestExpectToBeDefined(dishRelationFieldIndex);
    expect(dishRelationFieldIndex).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...dishRelationFieldIndex }),
    );

    const foodRelationFieldIndex = foodObject.indexMetadataList.find((index) =>
      index.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === foodRelationField.id,
      ),
    );

    expect(foodRelationFieldIndex).toBeUndefined();

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: dishRelationField.id,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: dishRelationField.id },
    });

    objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const dishObjectAfterDeletion = objects.find(
      (obj) => obj.id === createdObjectId,
    );
    const foodObjectAfterDeletion = objects.find(
      (obj) => obj.id === secondCreatedObjectId,
    );

    jestExpectToBeDefined(dishObjectAfterDeletion);
    jestExpectToBeDefined(foodObjectAfterDeletion);

    const dishRelationFieldAfterDeletion =
      dishObjectAfterDeletion.fieldsList.find(
        (field) =>
          field.type === FieldMetadataType.RELATION &&
          field.name === 'relationField',
      );

    expect(dishRelationFieldAfterDeletion).toBeUndefined();

    const foodRelationFieldAfterDeletion =
      foodObjectAfterDeletion.fieldsList.find(
        (field) =>
          field.type === FieldMetadataType.RELATION &&
          field.id === dishRelationField?.relation?.targetFieldMetadata.id,
      );

    expect(foodRelationFieldAfterDeletion).toBeUndefined();

    const dishRelationFieldIndexAfterDeletion =
      dishObjectAfterDeletion.indexMetadataList.find((index) =>
        index.indexFieldMetadataList.some(
          (indexField) => indexField.fieldMetadataId === dishRelationField.id,
        ),
      );

    expect(dishRelationFieldIndexAfterDeletion).toBeUndefined();
  });

  it('Should create and delete index on ONE_TO_MANY relation field creation and deletion', async () => {
    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'relationField',
        type: FieldMetadataType.RELATION,
        label: 'relation field',
        objectMetadataId: createdObjectId,
        relationCreationPayload: {
          type: RelationType.ONE_TO_MANY,
          targetFieldIcon: '123Icon',
          targetFieldLabel: 'whatever',
          targetObjectMetadataId: secondCreatedObjectId,
        },
      },
    });

    let objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const dishObject = objects.find((obj) => obj.id === createdObjectId);
    const foodObject = objects.find((obj) => obj.id === secondCreatedObjectId);

    jestExpectToBeDefined(dishObject);
    jestExpectToBeDefined(foodObject);

    const dishRelationField = dishObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.name === 'relationField',
    );

    jestExpectToBeDefined(dishRelationField?.relation);
    expect(dishRelationField.relation.targetObjectMetadata.id).toBe(
      secondCreatedObjectId,
    );

    const foodRelationField = foodObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.id === dishRelationField.relation?.targetFieldMetadata.id,
    );

    jestExpectToBeDefined(foodRelationField);

    const foodRelationFieldIndex = foodObject.indexMetadataList.find((index) =>
      index.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === foodRelationField.id,
      ),
    );

    jestExpectToBeDefined(foodRelationFieldIndex);
    expect(foodRelationFieldIndex).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny({ ...foodRelationFieldIndex }),
    );

    const dishRelationFieldIndex = dishObject.indexMetadataList.find((index) =>
      index.indexFieldMetadataList.some(
        (indexField) => indexField.fieldMetadataId === dishRelationField.id,
      ),
    );

    expect(dishRelationFieldIndex).toBeUndefined();

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: dishRelationField.id,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: dishRelationField.id },
    });

    objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const dishObjectAfterDeletion = objects.find(
      (obj) => obj.id === createdObjectId,
    );
    const foodObjectAfterDeletion = objects.find(
      (obj) => obj.id === secondCreatedObjectId,
    );

    jestExpectToBeDefined(dishObjectAfterDeletion);
    jestExpectToBeDefined(foodObjectAfterDeletion);

    const dishRelationFieldAfterDeletion =
      dishObjectAfterDeletion.fieldsList.find(
        (field) =>
          field.type === FieldMetadataType.RELATION &&
          field.name === 'relationField',
      );

    expect(dishRelationFieldAfterDeletion).toBeUndefined();

    const foodRelationFieldAfterDeletion =
      foodObjectAfterDeletion.fieldsList.find(
        (field) =>
          field.type === FieldMetadataType.RELATION &&
          field.id === dishRelationField?.relation?.targetFieldMetadata.id,
      );

    expect(foodRelationFieldAfterDeletion).toBeUndefined();

    const foodRelationFieldIndexAfterDeletion =
      foodObjectAfterDeletion.indexMetadataList.find((index) =>
        index.indexFieldMetadataList.some(
          (indexField) => indexField.fieldMetadataId === dishRelationField.id,
        ),
      );

    expect(foodRelationFieldIndexAfterDeletion).toBeUndefined();
  });
});
