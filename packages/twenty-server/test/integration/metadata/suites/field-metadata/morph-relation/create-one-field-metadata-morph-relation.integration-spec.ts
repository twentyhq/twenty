import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

describe('createOne FieldMetadataService morph relation fields', () => {
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
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataPersonId },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataOpportunityId },
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
      title: 'should create a MORPH_RELATION field type MANY_TO_ONE',
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
      title: 'should create a MORPH_RELATION field type ONE_TO_MANY',
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
    const contextPayload =
      typeof context === 'function'
        ? context({
            objectMetadataId: createdObjectMetadataOpportunityId,
            firstTargetObjectMetadataId: createdObjectMetadataPersonId,
            secondTargetObjectMetadataId: createdObjectMetadataCompanyId,
          })
        : context;

    const createdField = await createMorphRelationBetweenObjects({
      objectMetadataId: contextPayload.objectMetadataId,
      firstTargetObjectMetadataId: contextPayload.firstTargetObjectMetadataId,
      secondTargetObjectMetadataId: contextPayload.secondTargetObjectMetadataId,
      type: contextPayload.type,
      relationType: contextPayload.relationType,
    });

    expect(createdField.id).toBeDefined();
    expect(createdField.name).toBe('owner');
    expect(createdField.morphRelations[0].targetObjectMetadata.id).toBe(
      contextPayload.firstTargetObjectMetadataId,
    );
    expect(createdField.morphRelations[1].targetObjectMetadata.id).toBe(
      contextPayload.secondTargetObjectMetadataId,
    );

    const isManyToOne =
      contextPayload.relationType === RelationType.MANY_TO_ONE;

    if (isManyToOne) {
      expect(createdField.settings?.joinColumnName).toBe(
        'ownerPersonForMorphRelationId',
      );
    } else {
      expect(createdField.settings?.joinColumnName).toBeUndefined();
    }

    await deleteOneFieldMetadata({
      input: { idToDelete: createdField.id },
    }).catch();
  });
});
