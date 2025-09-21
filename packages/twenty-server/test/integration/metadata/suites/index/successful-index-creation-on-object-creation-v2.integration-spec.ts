import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

describe('Index metadata creation through object metadata creation v2', () => {
  let createdObjectId: string | undefined;

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

  afterEach(async () => {
    if (isDefined(createdObjectId)) {
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
    }
  });

  it('Should create an index on ts-search-vector standard field when creating a custom object', async () => {
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
      },
      gqlFields: `
        id
      `,
    });

    createdObjectId = data.createOneObject.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {
          id: {
            eq: createdObjectId,
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
      (object) => object.id === createdObjectId,
    ) as ObjectMetadataDTO & {
      fieldsList: FieldMetadataDTO[];
      indexMetadataList: Array<
        IndexMetadataDTO & {
          indexFieldMetadataList: IndexFieldMetadataDTO[];
        }
      >;
    };

    jestExpectToBeDefined(foundObject);
    expect(foundObject.id).toBe(createdObjectId);

    const tsVectorField = foundObject.fieldsList.find(
      (field) => field.type === FieldMetadataType.TS_VECTOR,
    );

    jestExpectToBeDefined(tsVectorField);

    expect(foundObject.indexMetadataList.length).toBe(1);
    const { indexFieldMetadataList, ...index } =
      foundObject.indexMetadataList[0];

    foundObject.indexMetadataList;
    expect(index);
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
});
