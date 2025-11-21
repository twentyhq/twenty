import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

const allTestsUseCases: EachTestingContext<{
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  isLabelSyncedWithName: boolean;
  newJoinColumnName: string | undefined;
  relationType: RelationType;
}>[] = [
  {
    title:
      'should rename custom object, and update both the field name and join column name of the morph relation that contains the object name',
    context: {
      nameSingular: 'personForRenameSecond2',
      namePlural: 'peopleForRenameSecond2',
      labelSingular: 'Person For Rename2',
      labelPlural: 'People For Rename2',
      isLabelSyncedWithName: false,
      newJoinColumnName: 'ownerPersonForRenameSecond2Id',
      relationType: RelationType.MANY_TO_ONE,
    },
  },
  {
    title:
      'should rename custom object, and update both the field name and join column name of the morph relation that contains the object name if label is sync with name',
    context: {
      nameSingular: 'personForRenameSecond3',
      namePlural: 'peopleForRenameSecond3',
      labelSingular: 'person For Rename Second3',
      labelPlural: 'people For Rename Second3',
      isLabelSyncedWithName: true,
      newJoinColumnName: 'ownerPersonForRenameSecond3Id',
      relationType: RelationType.MANY_TO_ONE,
    },
  },
  {
    title:
      'should rename custom object, and update both the field name and join column name of the morph relation that contains the object name with ONE_TO_MANY relation type',
    context: {
      nameSingular: 'personForRenameSecond4',
      namePlural: 'peopleForRenameSecond4',
      labelSingular: 'Person For Rename Second4',
      labelPlural: 'People For Rename Second4',
      isLabelSyncedWithName: true,
      newJoinColumnName: undefined,
      relationType: RelationType.ONE_TO_MANY,
    },
  },
];

describe('Rename an object metadata with morph relation should succeed', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: aId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForRenameSecond',
        namePlural: 'opportunitiesForRenameSecond',
        labelSingular: 'Opportunity For Rename',
        labelPlural: 'Opportunities For Rename',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = aId;
    const {
      data: {
        createOneObject: { id: bId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'personForRenameSecond',
        namePlural: 'peopleForRenameSecond',
        labelSingular: 'Person For Rename',
        labelPlural: 'People For Rename',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = bId;
    const {
      data: {
        createOneObject: { id: cId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'companyForRenameSecond',
        namePlural: 'companiesForRenameSecond',
        labelSingular: 'Company For Rename',
        labelPlural: 'Companies For Rename',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = cId;
  });

  afterEach(async () => {
    const createdObjectMetadataIds = [
      createdObjectMetadataPersonId,
      createdObjectMetadataOpportunityId,
      createdObjectMetadataCompanyId,
    ];

    for (const objectMetadataId of createdObjectMetadataIds) {
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
    }
  });

  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const {
        nameSingular,
        namePlural,
        labelSingular,
        labelPlural,
        isLabelSyncedWithName,
        newJoinColumnName,
        relationType,
      } = context;

      const morphRelationField = await createMorphRelationBetweenObjects({
        name: 'owner',
        objectMetadataId: createdObjectMetadataOpportunityId,
        firstTargetObjectMetadataId: createdObjectMetadataPersonId,
        secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
        type: FieldMetadataType.MORPH_RELATION,
        relationType,
      });

      expect(morphRelationField.morphRelations.length).toBe(2);

      const { data } = await updateOneObjectMetadata({
        expectToFail: false,
        gqlFields: `
    nameSingular
    labelSingular
    namePlural
    labelPlural
    `,
        input: {
          idToUpdate: createdObjectMetadataPersonId,
          updatePayload: {
            nameSingular,
            namePlural,
            labelSingular,
            labelPlural,
            isLabelSyncedWithName,
          },
        },
      });

      expect(data.updateOneObject.nameSingular).toBe(nameSingular);

      const ownerFieldMetadataOnPersonId =
        morphRelationField.morphRelations.find(
          (morphRelation) =>
            morphRelation.targetObjectMetadata.id ===
            createdObjectMetadataPersonId,
        )?.sourceFieldMetadata.id;

      if (!ownerFieldMetadataOnPersonId) {
        throw new Error(
          'Morph Relation Error: Owner field metadata on person not found',
        );
      }

      const fieldAfterRenaming = await findFieldMetadata({
        fieldMetadataId: ownerFieldMetadataOnPersonId,
      });

      expect(fieldAfterRenaming.settings.joinColumnName).toBe(
        newJoinColumnName,
      );
    },
  );

  it('should handle morph field related index update after an target object name update', async () => {
    await createMorphRelationBetweenObjects({
      name: 'owner',
      objectMetadataId: createdObjectMetadataOpportunityId,
      firstTargetObjectMetadataId: createdObjectMetadataPersonId,
      secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const [
      objectMetadataOpportunityDto,
      objectMetadataPersonDto,
      objectMetadataCompanyDto,
    ] = [
      createdObjectMetadataOpportunityId,
      createdObjectMetadataPersonId,
      createdObjectMetadataCompanyId,
    ].map((searchId) => objects.find((el) => el.id === searchId));

    jestExpectToBeDefined(objectMetadataOpportunityDto);
    jestExpectToBeDefined(objectMetadataPersonDto);
    jestExpectToBeDefined(objectMetadataCompanyDto);

    expect(objectMetadataOpportunityDto.indexMetadataList)
      .toMatchInlineSnapshot(`
[
  {
    "indexFieldMetadataList": [
      {
        "createdAt": "2025-11-21T10:49:12.687Z",
        "fieldMetadataId": "1fdcd4ea-874e-4c31-8e46-489ae475d018",
        "id": "e0464bd2-3353-46da-ad9a-b293466a50f6",
        "order": 0,
        "updatedAt": "2025-11-21T10:49:12.687Z",
      },
    ],
    "indexType": "GIN",
    "isCustom": false,
    "isUnique": false,
    "name": "IDX_40200e590d3df92b24ae83562a5",
  },
  {
    "indexFieldMetadataList": [
      {
        "createdAt": "2025-11-21T10:49:14.572Z",
        "fieldMetadataId": "adc67505-8b32-41c5-a091-eb1f5db9eaed",
        "id": "969cfb65-f315-4dfd-9374-5a1642dcde6f",
        "order": 0,
        "updatedAt": "2025-11-21T10:49:14.572Z",
      },
    ],
    "indexType": "BTREE",
    "isCustom": true,
    "isUnique": false,
    "name": "IDX_24ffb84b5e10b297f43de77d3c9",
  },
  {
    "indexFieldMetadataList": [
      {
        "createdAt": "2025-11-21T10:49:14.572Z",
        "fieldMetadataId": "c1ff9c17-e4f1-4a6d-9762-5133e0096395",
        "id": "99eed91e-45d0-49e5-84dc-008925724a96",
        "order": 0,
        "updatedAt": "2025-11-21T10:49:14.572Z",
      },
    ],
    "indexType": "BTREE",
    "isCustom": true,
    "isUnique": false,
    "name": "IDX_bbd1c2c6b957c166e0950044d6c",
  },
]
`);
    expect(objectMetadataPersonDto.indexMetadataList).toMatchInlineSnapshot(`
[
  {
    "indexFieldMetadataList": [
      {
        "createdAt": "2025-11-21T10:49:13.427Z",
        "fieldMetadataId": "4bf2c306-99e1-435a-8c95-3e286ab39a46",
        "id": "fd8cd9df-e7e2-4fc3-be0e-55817887aecd",
        "order": 0,
        "updatedAt": "2025-11-21T10:49:13.427Z",
      },
    ],
    "indexType": "GIN",
    "isCustom": false,
    "isUnique": false,
    "name": "IDX_71e8260de81b7b73409286e7bc9",
  },
]
`);
    expect(objectMetadataCompanyDto.indexMetadataList).toMatchInlineSnapshot(`
[
  {
    "indexFieldMetadataList": [
      {
        "createdAt": "2025-11-21T10:49:14.299Z",
        "fieldMetadataId": "d5f6a52d-eab7-4865-a742-9ba5c90061b2",
        "id": "81d01596-5357-4e74-aa3a-e725d47907d8",
        "order": 0,
        "updatedAt": "2025-11-21T10:49:14.299Z",
      },
    ],
    "indexType": "GIN",
    "isCustom": false,
    "isUnique": false,
    "name": "IDX_0fc228563008e8e1b4845918fea",
  },
]
`);
  });
});

const findFieldMetadata = async ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}) => {
  const { fields } = await findManyFieldsMetadata({
    gqlFields: `
      id
      name
      object { id nameSingular }
      relation { type targetFieldMetadata { id } targetObjectMetadata { id } }
      settings
    `,
    input: {
      filter: { id: { eq: fieldMetadataId } },
      paging: { first: 1 },
    },
    expectToFail: false,
  });

  return fields[0]?.node;
};
