import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';

describe('Object metadata creation with index creation v2', () => {
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
  it('should create unique index for unique field', async () => {
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

    const foundObject = objects.find((object) => object.id === createdObjectId);
    jestExpectToBeDefined(foundObject);
    expect(foundObject.id).toBe(createdObjectId);
    expect(foundObject).toMatchInlineSnapshot(`
{
  "id": "851cded3-68d4-47cc-b286-eaf19f2905f2",
  "indexMetadataList": [
    {
      "indexType": "GIN",
      "isCustom": false,
      "isUnique": false,
      "name": "IDX_be6fe08944beb9886fb83dfbbf1",
    },
  ],
  "nameSingular": "dish",
}
`);
  });
});
