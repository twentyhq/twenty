import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

const findObjectWithIndex = async ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const foundObject = objects.find((object) => object.id === objectMetadataId);

  jestExpectToBeDefined(foundObject);
  expect(foundObject.id).toBe(objectMetadataId);

  return foundObject;
};

describe('Index metadata creation through object metadata creation v2', () => {
  let createdObjectId: string;

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
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: createdObjectId,
        updatePayload: {
          isActive: false,
        },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectId },
    });
  });

  it('Should create an index on ts-search-vector standard field when creating a custom object', async () => {
    const foundObject = await findObjectWithIndex({
      objectMetadataId: createdObjectId,
    });
    const tsVectorField = foundObject.fieldsList.find(
      (field) => field.type === FieldMetadataType.TS_VECTOR,
    );

    jestExpectToBeDefined(tsVectorField);

    expect(foundObject.indexMetadataList.length).toBe(1);
    const { indexFieldMetadataList, ...index } =
      foundObject.indexMetadataList[0];

    expect(index).toMatchSnapshot();
    expect(indexFieldMetadataList.length).toBe(1);
    expect(indexFieldMetadataList).toMatchObject([
      {
        id: expect.any(String),
        fieldMetadataId: tsVectorField.id,
        order: 0,
      },
    ]);
  });

  it('Should update index on related object name singular update', async () => {
    const foundObject = await findObjectWithIndex({
      objectMetadataId: createdObjectId,
    });

    expect(foundObject.indexMetadataList.length).toBe(1);
    const { indexFieldMetadataList: _, ...index } =
      foundObject.indexMetadataList[0];

    expect(index).toMatchSnapshot();
    const fromIndexName = index.name;

    await updateOneObjectMetadata({
      input: {
        idToUpdate: foundObject.id,
        updatePayload: {
          nameSingular: 'updatedName',
        },
      },
    });

    {
      const foundObject = await findObjectWithIndex({
        objectMetadataId: createdObjectId,
      });

      expect(foundObject.indexMetadataList.length).toBe(1);
      const { indexFieldMetadataList: _, ...index } =
        foundObject.indexMetadataList[0];

      expect(index).toMatchSnapshot();
      expect(fromIndexName).not.toBe(index.name);
    }
  });
});
