import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('deleteOne FieldMetadataService morph relation fields', () => {
  let createdObjectMetadataPersonId = '';
  let createdObjectMetadataOpportunityId = '';
  let createdObjectMetadataCompanyId = '';

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'personForMorphRelation',
        namePlural: 'peopleForMorphRelation',
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
      input: {
        nameSingular: 'companyForMorphRelation',
        namePlural: 'companiesForMorphRelation',
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
      input: {
        nameSingular: 'opportunityForMorphRelation',
        namePlural: 'opportunitiesForMorphRelation',
        labelSingular: 'Opportunity For Morph Relation',
        labelPlural: 'Opportunities For Morph Relation',
        icon: 'IconOpportunity',
      },
    });

    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;
  });
  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataPersonId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataPersonId },
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataOpportunityId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataOpportunityId },
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataCompanyId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataCompanyId },
    });
  });

  type EachTestingContextArray = EachTestingContext<
    (args: {
      objectMetadataId: string;
      firstTargetObjectMetadataId: string;
      secondTargetObjectMetadataId: string;
    }) => {
      relationType: RelationType;
      objectMetadataId: string;
      firstTargetObjectMetadataId: string;
      secondTargetObjectMetadataId: string;
      type: FieldMetadataType;
    }
  >[];

  const eachTestingContextArray: EachTestingContextArray = [
    {
      title: 'should delete a MORPH_RELATION field type MANY_TO_ONE',
      context: ({
        objectMetadataId,
        firstTargetObjectMetadataId,
        secondTargetObjectMetadataId,
      }) => ({
        relationType: RelationType.MANY_TO_ONE,
        objectMetadataId,
        firstTargetObjectMetadataId,
        secondTargetObjectMetadataId,
        type: FieldMetadataType.MORPH_RELATION,
      }),
    },
    {
      title: 'should delete a MORPH_RELATION field type ONE_TO_MANY',
      context: ({
        objectMetadataId,
        firstTargetObjectMetadataId,
        secondTargetObjectMetadataId,
      }) => ({
        relationType: RelationType.ONE_TO_MANY,
        objectMetadataId,
        firstTargetObjectMetadataId,
        secondTargetObjectMetadataId,
        type: FieldMetadataType.MORPH_RELATION,
      }),
    },
  ];

  const eachTestingContextForRelationWithMorphRelationTargetArray: EachTestingContextArray =
    [
      {
        title:
          'should delete a ONE_TO_MANY RELATION that has a MORPH_RELATION field as target',
        context: ({
          objectMetadataId,
          firstTargetObjectMetadataId,
          secondTargetObjectMetadataId,
        }) => ({
          relationType: RelationType.MANY_TO_ONE,
          objectMetadataId,
          firstTargetObjectMetadataId,
          secondTargetObjectMetadataId,
          type: FieldMetadataType.MORPH_RELATION,
        }),
      },
      {
        title:
          'should delete a MANY_TO_ONE RELATION that has a MORPH_RELATION field as target',
        context: ({
          objectMetadataId,
          firstTargetObjectMetadataId,
          secondTargetObjectMetadataId,
        }) => ({
          relationType: RelationType.ONE_TO_MANY,
          objectMetadataId,
          firstTargetObjectMetadataId,
          secondTargetObjectMetadataId,
          type: FieldMetadataType.MORPH_RELATION,
        }),
      },
    ];

  it.each(eachTestingContextArray)('$title', async ({ context }) => {
    const contextPayload = context({
      objectMetadataId: createdObjectMetadataOpportunityId,
      firstTargetObjectMetadataId: createdObjectMetadataPersonId,
      secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
    });

    const createdField = await createMorphRelationBetweenObjects({
      objectMetadataId: contextPayload.objectMetadataId,
      firstTargetObjectMetadataId: contextPayload.firstTargetObjectMetadataId,
      secondTargetObjectMetadataId: contextPayload.secondTargetObjectMetadataId,
      type: contextPayload.type,
      relationType: contextPayload.relationType,
    });

    const deactivatedField = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdField.id,
        updatePayload: { isActive: false },
      },
      gqlFields: `
            id
            isActive
        `,
    });

    expect(deactivatedField.data.updateOneField.id).toBe(createdField.id);

    const { errors } = await deleteOneFieldMetadata({
      input: { idToDelete: createdField.id },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  });

  it.each(eachTestingContextForRelationWithMorphRelationTargetArray)(
    '$title',
    async ({ context }) => {
      const contextPayload = context({
        objectMetadataId: createdObjectMetadataOpportunityId,
        firstTargetObjectMetadataId: createdObjectMetadataPersonId,
        secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
      });

      const createdField = await createMorphRelationBetweenObjects({
        objectMetadataId: contextPayload.objectMetadataId,
        firstTargetObjectMetadataId: contextPayload.firstTargetObjectMetadataId,
        secondTargetObjectMetadataId:
          contextPayload.secondTargetObjectMetadataId,
        type: contextPayload.type,
        relationType: contextPayload.relationType,
      });

      const targetRelationField =
        createdField.morphRelations[0].targetFieldMetadata;

      const deactivatedTargetRelationField = await updateOneFieldMetadata({
        input: {
          idToUpdate: targetRelationField.id,
          updatePayload: { isActive: false },
        },
        gqlFields: `
            id
            isActive
        `,
      });

      expect(deactivatedTargetRelationField.data.updateOneField.id).toBe(
        targetRelationField.id,
      );

      const { errors } = await deleteOneFieldMetadata({
        input: { idToDelete: targetRelationField.id },
        expectToFail: false,
      });

      expect(errors).toBeUndefined();
    },
  );
});
