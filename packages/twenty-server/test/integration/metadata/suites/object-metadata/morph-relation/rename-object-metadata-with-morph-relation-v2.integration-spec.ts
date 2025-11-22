import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';

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

  it('should update indexes on ONE_TO_MANY morph field related target object name update', async () => {
    const morphRelationField = await createMorphRelationBetweenObjects({
      name: 'owner',
      objectMetadataId: createdObjectMetadataOpportunityId,
      firstTargetObjectMetadataId: createdObjectMetadataPersonId,
      secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.ONE_TO_MANY,
    });

    expect(morphRelationField.morphRelations.length).toBe(2);

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    let relationIndexByFieldId: Record<
      string,
      IndexMetadataDTO & {
        indexFieldMetadataList: IndexFieldMetadataDTO[];
      }
    > = {};

    const morphParentObject = objects.find(
      (object) => object.id === createdObjectMetadataOpportunityId,
    );

    jestExpectToBeDefined(morphParentObject);

    for (const {
      targetObjectMetadata,
      targetFieldMetadata,
      sourceFieldMetadata,
    } of morphRelationField.morphRelations) {
      const relatedObject = objects.find(
        (object) => object.id === targetObjectMetadata.id,
      );

      jestExpectToBeDefined(relatedObject);

      const objectRelatedIndexes = relatedObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId === targetFieldMetadata.id,
          ),
      );

      expect(objectRelatedIndexes.length).toBe(1);
      const [relationIndex] = objectRelatedIndexes;

      jestExpectToBeDefined(relationIndex);
      expect(relationIndex).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...relationIndex }),
      );

      relationIndexByFieldId[targetFieldMetadata.id] = relationIndex;

      const parentRelationIndex = morphParentObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId == sourceFieldMetadata.id,
          ),
      );

      expect(parentRelationIndex.length).toBe(0);
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataPersonId,
        updatePayload: {
          nameSingular: 'personForRenameSecondUpdated',
          namePlural: 'peopleForRenameSecondUpdated',
          labelSingular: 'Person For Rename Updated',
          labelPlural: 'People For Rename Updated',
        },
      },
    });

    const updatedObjects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const morphParentObjectAfterUpdate = objects.find(
      (object) => object.id === createdObjectMetadataOpportunityId,
    );

    jestExpectToBeDefined(morphParentObjectAfterUpdate);
    for (const {
      targetObjectMetadata,
      targetFieldMetadata,
      sourceFieldMetadata,
    } of morphRelationField.morphRelations) {
      const relatedObject = updatedObjects.find(
        (object) => object.id === targetObjectMetadata.id,
      );

      jestExpectToBeDefined(relatedObject);

      const objectRelatedIndexes = relatedObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId === targetFieldMetadata.id,
          ),
      );

      expect(objectRelatedIndexes.length).toBe(1);
      const [relationIndex] = objectRelatedIndexes;

      jestExpectToBeDefined(relationIndex);
      expect(relationIndex).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...relationIndex }),
      );
      const previousIndex = relationIndexByFieldId[targetFieldMetadata.id];

      jestExpectToBeDefined(previousIndex);
      if (targetObjectMetadata.id === createdObjectMetadataPersonId) {
        expect(previousIndex.name).not.toBe(relationIndex.name);
      } else {
        expect(previousIndex.name).toBe(relationIndex.name);
      }

      const parentRelationIndex =
        morphParentObjectAfterUpdate.indexMetadataList.filter((index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId == sourceFieldMetadata.id,
          ),
        );

      expect(parentRelationIndex.length).toBe(0);
    }
  });

  it('should not update morph index on MANY_TO_ONE morph field related target object name update', async () => {
    const morphRelationField = await createMorphRelationBetweenObjects({
      name: 'owner',
      objectMetadataId: createdObjectMetadataOpportunityId,
      firstTargetObjectMetadataId: createdObjectMetadataPersonId,
      secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
    });

    expect(morphRelationField.morphRelations.length).toBe(2);

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    let relationIndexByFieldId: Record<
      string,
      IndexMetadataDTO & {
        indexFieldMetadataList: IndexFieldMetadataDTO[];
      }
    > = {};

    const morphParentObject = objects.find(
      (object) => object.id === createdObjectMetadataOpportunityId,
    );

    jestExpectToBeDefined(morphParentObject);

    for (const {
      targetObjectMetadata,
      targetFieldMetadata,
      sourceFieldMetadata,
    } of morphRelationField.morphRelations) {
      const relatedObject = objects.find(
        (object) => object.id === targetObjectMetadata.id,
      );

      jestExpectToBeDefined(relatedObject);

      const objectRelatedIndexes = relatedObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId === targetFieldMetadata.id,
          ),
      );

      expect(objectRelatedIndexes.length).toBe(0);

      const parentRelationIndex = morphParentObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId == sourceFieldMetadata.id,
          ),
      );

      expect(parentRelationIndex.length).toBe(1);
      const [relationIndex] = parentRelationIndex;

      relationIndexByFieldId[
        relationIndex.indexFieldMetadataList[0].fieldMetadataId
      ] = relationIndex;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataPersonId,
        updatePayload: {
          nameSingular: 'personForRenameSecondUpdated',
          namePlural: 'peopleForRenameSecondUpdated',
          labelSingular: 'Person For Rename Updated',
          labelPlural: 'People For Rename Updated',
        },
      },
    });

    const updatedObjects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const morphParentObjectAfterUpdate = objects.find(
      (object) => object.id === createdObjectMetadataOpportunityId,
    );

    jestExpectToBeDefined(morphParentObjectAfterUpdate);

    for (const {
      targetObjectMetadata,
      targetFieldMetadata,
      sourceFieldMetadata,
    } of morphRelationField.morphRelations) {
      const relatedObject = updatedObjects.find(
        (object) => object.id === targetObjectMetadata.id,
      );

      jestExpectToBeDefined(relatedObject);

      const objectRelatedIndexes = relatedObject.indexMetadataList.filter(
        (index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId === targetFieldMetadata.id,
          ),
      );

      expect(objectRelatedIndexes.length).toBe(0);

      const parentRelationIndex =
        morphParentObjectAfterUpdate.indexMetadataList.filter((index) =>
          index.indexFieldMetadataList.some(
            (indexField) =>
              indexField.fieldMetadataId == sourceFieldMetadata.id,
          ),
        );

      expect(parentRelationIndex.length).toBe(1);

      const [relationIndex] = parentRelationIndex;
      const previousIndex = relationIndexByFieldId[sourceFieldMetadata.id];

      expect(previousIndex.name).toBe(relationIndex.name);
    }
  });
});
