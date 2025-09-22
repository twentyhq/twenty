import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { CUSTOM_OBJECT_FOOD } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-food.constants';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';

describe('Index metadata deletion through  creation v2', () => {
  let createdObjectId: string;
  let secondCreatedObjectId: string;

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

  it('Should deleted index when all sub fields metadata gets deleted', async () => {
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

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    expect(objects).toMatchInlineSnapshot(`
[
  {
    "fieldsList": [
      {
        "id": "55b1bd91-6127-42eb-9781-84635bbb97f8",
        "type": "TEXT",
      },
      {
        "id": "5cee6d25-41bf-42cf-ae14-a3d3cc71d674",
        "type": "DATE_TIME",
      },
      {
        "id": "6bd02fbe-d1bb-44c1-ba0c-9e2a914c6312",
        "type": "DATE_TIME",
      },
      {
        "id": "657948c0-bdf6-4ec5-8e7e-d030db2f09ff",
        "type": "DATE_TIME",
      },
      {
        "id": "a55cb3d1-67c2-48a3-9747-16f916c15b2f",
        "type": "ACTOR",
      },
      {
        "id": "b051ea0c-af73-4835-8f25-c3ae2eed4624",
        "type": "POSITION",
      },
      {
        "id": "b86b764b-3931-4534-a8db-6aba38086c72",
        "type": "RELATION",
      },
      {
        "id": "28297858-d5a7-4c24-83a0-4b9fb3c640b9",
        "type": "UUID",
      },
      {
        "id": "974f68e8-436e-4094-937e-aaa53c800cb2",
        "type": "RELATION",
      },
      {
        "id": "9ffda548-6dfa-4c1a-8d91-e9ea832e54e1",
        "type": "RELATION",
      },
      {
        "id": "15da3103-2a61-45a9-aa2b-06f460e12875",
        "type": "RELATION",
      },
      {
        "id": "b23b204b-1d4c-463d-9269-494b109880ce",
        "type": "RELATION",
      },
      {
        "id": "a88c185f-14c0-40d2-b690-759f3fda760f",
        "type": "TS_VECTOR",
      },
      {
        "id": "3827ffbc-9b9a-4be1-99ad-8b584c9addf6",
        "type": "SELECT",
      },
      {
        "id": "572dbff1-58d4-467b-b2ab-57547715154f",
        "type": "MULTI_SELECT",
      },
      {
        "id": "f8206c73-2d18-48c6-831a-30034c7cf654",
        "type": "TEXT",
      },
      {
        "id": "d27a3feb-01b8-4137-85a3-d08729e8cc1f",
        "type": "NUMBER",
      },
      {
        "id": "8d0df0c1-5a0b-425b-865f-5c31b0e8f8ad",
        "type": "ADDRESS",
      },
      {
        "id": "fe561403-cbd7-4003-966f-7598b1efcaf2",
        "type": "PHONES",
      },
      {
        "id": "7a61f10d-0fde-4177-a13f-f3a9fd62746a",
        "type": "EMAILS",
      },
      {
        "id": "9ae6fca2-6646-491f-a6bf-77b8fe9f95e5",
        "type": "DATE",
      },
      {
        "id": "fff677cd-c3d0-4d18-892b-5b6fb715e3aa",
        "type": "BOOLEAN",
      },
      {
        "id": "481ad31c-5fb1-4daf-9ae9-70fcee0bbd08",
        "type": "LINKS",
      },
      {
        "id": "81527788-ce16-4594-ab94-dbdc47997b24",
        "type": "CURRENCY",
      },
      {
        "id": "31c12152-4471-48c5-a7ea-fccc4b006ec9",
        "type": "FULL_NAME",
      },
      {
        "id": "6cf32984-4e38-4eb5-82a4-7974dc13da27",
        "type": "RATING",
      },
      {
        "id": "0fa7391c-3216-4338-a524-4ee951e7994e",
        "type": "RICH_TEXT",
      },
      {
        "id": "99052029-eb90-4e0f-b9ec-cb36101022f8",
        "type": "ARRAY",
      },
      {
        "id": "7880a0fd-abc6-42fc-84d6-8503c311ed4b",
        "type": "RAW_JSON",
      },
      {
        "id": "c3289aa9-a2ff-4687-b877-af4b43e5b5e0",
        "type": "MORPH_RELATION",
      },
      {
        "id": "50916a1a-a49b-40b8-a8ce-c8674dec607b",
        "type": "MORPH_RELATION",
      },
    ],
    "id": "fe97395c-67d5-4d26-bdab-c582c96a4300",
    "indexMetadataList": [
      {
        "indexFieldMetadataList": [
          {
            "createdAt": "2025-09-22T11:12:52.942Z",
            "fieldMetadataId": "a88c185f-14c0-40d2-b690-759f3fda760f",
            "id": "572e71b6-10e9-468a-80d5-8e9dc414110a",
            "order": 0,
            "updatedAt": "2025-09-22T11:12:52.942Z",
          },
        ],
        "indexType": "GIN",
        "isCustom": false,
        "isUnique": false,
        "name": "IDX_82c02a6c94da4f260020dfb54b9",
      },
    ],
    "nameSingular": "pet",
  },
]
`);

    const dishObject = objects.find((obj) => obj.id === createdObjectId);
    const foodObject = objects.find((obj) => obj.id === secondCreatedObjectId);
    jestExpectToBeDefined(dishObject);
    jestExpectToBeDefined(foodObject);

    const dishRelationField = dishObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.name === 'relationField',
    ) as FlatFieldMetadata<FieldMetadataType.RELATION> | undefined;
    jestExpectToBeDefined(dishRelationField);
    expect(dishRelationField.relationTargetObjectMetadataId).toBe(
      secondCreatedObjectId,
    );

    const foodRelationField = foodObject.fieldsList.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.id === dishRelationField.relationTargetFieldMetadataId,
    );
    jestExpectToBeDefined(foodRelationField);

    expect(dishObject.indexMetadataList.length).toBeGreaterThan(0);
    expect(foodObject.indexMetadataList.length).toBe(0);
  });
});
