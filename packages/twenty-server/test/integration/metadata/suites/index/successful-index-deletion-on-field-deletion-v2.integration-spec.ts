import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

const findObjectWithIndex = async ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { objects } = await findManyObjectMetadata({
    expectToFail: false,
    input: {
      filter: {
        id: {
          eq: objectMetadataId,
        },
      },
      paging: {
        first: 1,
      },
    },
    gqlFields: `
        id
        nameSingular
        fieldsList {
          id
          type
        }
        indexMetadataList {
          name
          isUnique
          isCustom
          indexType
          indexFieldMetadataList {
            id
            fieldMetadataId
            createdAt
            updatedAt
            order
          }
        }
      `,
  });

  const foundObject = objects.find(
    (object) => object.id === objectMetadataId,
  ) as ObjectMetadataDTO & {
    fieldsList: FieldMetadataDTO[];
    indexMetadataList: Array<
      IndexMetadataDTO & {
        indexFieldMetadataList: IndexFieldMetadataDTO[];
      }
    >;
  };

  jestExpectToBeDefined(foundObject);
  expect(foundObject.id).toBe(objectMetadataId);
  return foundObject;
};

describe('Index metadata deletion through  creation v2', () => {
  let createdObjectId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

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

  it('Should deleted index when all sub fields metadata gets deleted', async () => {
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

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: tsVectorField.id,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: {
        idToDelete: tsVectorField.id,
      },
    });

    {
      const foundObject = await findObjectWithIndex({
        objectMetadataId: createdObjectId,
      });
      const tsVectorField = foundObject.fieldsList.find(
        (field) => field.type === FieldMetadataType.TS_VECTOR,
      );

      expect(tsVectorField).toBeUndefined();

      expect(foundObject.indexMetadataList.length).toBe(0);
    }
  });
});
