import { isDefined } from 'class-validator';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

describe('updateOne FieldMetadataService morph relation fields v2 - Add one target', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;
  let createdObjectMetadataNewTargetId: string;
  let createdFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'personForMorphRelationSecond',
        namePlural: 'peopleForMorphRelationSecond',
        labelSingular: 'Person For Morph Relation',
        labelPlural: 'People For Morph Relation',
        icon: 'IconPerson',
      },
    });

    createdObjectMetadataPersonId = objectMetadataPersonId;

    const {
      data: {
        createOneObject: { id: objectMetadataCompanyId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'companyForMorphRelationSecond',
        namePlural: 'companiesForMorphRelationSecond',
        labelSingular: 'Company For Morph Relation',
        labelPlural: 'Companies For Morph Relation',
        icon: 'IconCompany',
      },
    });

    createdObjectMetadataCompanyId = objectMetadataCompanyId;

    const {
      data: {
        createOneObject: { id: objectMetadataOpportunityId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'opportunityForMorphRelationSecond',
        namePlural: 'opportunitiesForMorphRelationSecond',
        labelSingular: 'Opportunity For Morph Relation',
        labelPlural: 'Opportunities For Morph Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;

    const {
      data: {
        createOneObject: { id: objectMetadataNewTargetId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'newTargetForMorphRelation',
        namePlural: 'newTargetsForMorphRelation',
        labelSingular: 'New Target For Morph Relation',
        labelPlural: 'New Targets For Morph Relation',
        icon: 'IconNewTarget',
      },
    });

    createdObjectMetadataNewTargetId = objectMetadataNewTargetId;
  });

  afterAll(async () => {
    const createdObjectMetadataIds = [
      createdObjectMetadataPersonId,
      createdObjectMetadataOpportunityId,
      createdObjectMetadataCompanyId,
      createdObjectMetadataNewTargetId,
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

  beforeEach(async () => {
    const {
      data: { createOneField: rawCreateOneField },
    } = await createOneFieldMetadata({
      input: {
        label: 'field label',
        name: 'fieldName',
        objectMetadataId: createdObjectMetadataCompanyId,
        description: 'Description for all',
        type: FieldMetadataType.MORPH_RELATION,
        morphRelationsCreationPayload: [
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'toto',
            targetObjectMetadataId: createdObjectMetadataOpportunityId,
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'tata',
            targetObjectMetadataId: createdObjectMetadataPersonId,
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      expectToFail: false,
    });

    createdFieldMetadataId = rawCreateOneField.id;
  });

  afterEach(async () => {
    if (!isDefined(createdFieldMetadataId)) {
      return;
    }

    await updateOneFieldMetadata({
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
      expectToFail: false,
    });

    await deleteOneFieldMetadata({
      input: {
        idToDelete: createdFieldMetadataId,
      },
      expectToFail: false,
    });

    createdFieldMetadataId = '';
  });

  it('When adding one object metadata target to pre-existing morph relation, the relation on the target object metadata should be updated', async () => {
    const input = {
      idToUpdate: createdFieldMetadataId,
      updatePayload: {
        morphRelationsUpdatePayload: [
          {
            targetObjectMetadataId: createdObjectMetadataNewTargetId,
          },
        ],
      },
    };

    const result = await updateOneFieldMetadata({
      expectToFail: false,
      input,
      gqlFields: `
      id
      name
      morphRelations {
        type
        targetFieldMetadata {
          id
          name
        }
        targetObjectMetadata {
          id
          nameSingular
        }
        sourceFieldMetadata {
          id
          name
        }
      }
      `,
    });

    const updateOneField = result.data
      ?.updateOneField as unknown as FieldMetadataDTO & {
      morphRelations: RelationDTO[];
    };

    expect(updateOneField?.morphRelations.length).toBe(3);

    const objectMetadatasWithIndexes = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const newLyCreatedMorphRelation = updateOneField?.morphRelations.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.id ===
        createdObjectMetadataNewTargetId,
    );

    jestExpectToBeDefined(newLyCreatedMorphRelation);

    const sourceObjectMetadataIndexFieldMetadataList =
      objectMetadatasWithIndexes.find(
        (objectMetadataWithIndexes) =>
          objectMetadataWithIndexes.id === createdObjectMetadataCompanyId,
      )?.indexMetadataList;

    const isIndexCreated = sourceObjectMetadataIndexFieldMetadataList?.some(
      (indexList) =>
        indexList.indexFieldMetadataList.some(
          (indexField) =>
            indexField.fieldMetadataId ===
            newLyCreatedMorphRelation.sourceFieldMetadata.id,
        ),
    );

    expect(isIndexCreated).toBe(true);
  });

  // todo and the name ?
  it('Should add a new morph relation target and update the label of the field at the same time and expect the added created morph and the old morphs to follow the updated label', async () => {
    const input = {
      idToUpdate: createdFieldMetadataId,
      updatePayload: {
        label: 'new label for morph Fields',
        morphRelationsUpdatePayload: [
          {
            targetObjectMetadataId: createdObjectMetadataNewTargetId,
          },
        ],
      },
    };

    const result = await updateOneFieldMetadata({
      expectToFail: false,
      input,
      gqlFields: `
      id
      name
      label
      morphRelations {
        type
        targetFieldMetadata {
          id
          name
        }
        sourceFieldMetadata {
          id
          name
          label
        }
      }
      `,
    });

    const updateOneField = result.data
      ?.updateOneField as unknown as FieldMetadataDTO & {
      morphRelations: RelationDTO[];
    };

    const morphRelationsLabels = updateOneField.morphRelations.map(
      (morphRelation) => morphRelation.sourceFieldMetadata.label,
    );

    expect(morphRelationsLabels[0]).toBe('new label for morph Fields');
    const morphRelationsLabelsSet = new Set(morphRelationsLabels);

    expect(morphRelationsLabelsSet.size).toBe(1);
  });
});
