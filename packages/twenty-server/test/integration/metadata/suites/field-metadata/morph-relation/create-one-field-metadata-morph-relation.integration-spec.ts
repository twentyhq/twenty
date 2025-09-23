import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('createOne FieldMetadataService morph relation fields', () => {
  let createdObjectMetadataPersonId = '';
  let createdObjectMetadataOpportunityId = '';
  let createdObjectMetadataCompanyId = '';

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
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
      expectToFail: false,
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
      expectToFail: false,
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
      expectToFail: false,
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
      expectToFail: false,
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
      expectToFail: false,
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

  it.each(eachTestingContextFilter(eachTestingContextArray))(
    '$title',
    async ({ context }) => {
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
        secondTargetObjectMetadataId:
          contextPayload.secondTargetObjectMetadataId,
        type: contextPayload.type,
        relationType: contextPayload.relationType,
      });

      expect(createdField.id).toBeDefined();

      const morphRelationTargetIds = createdField.morphRelations.map(
        (relation) => relation.targetObjectMetadata.id,
      );

      expect(morphRelationTargetIds).toContain(
        contextPayload.firstTargetObjectMetadataId,
      );
      expect(morphRelationTargetIds).toContain(
        contextPayload.secondTargetObjectMetadataId,
      );

      const isManyToOne =
        contextPayload.relationType === RelationType.MANY_TO_ONE;

      if (isManyToOne) {
        expect(createdField.settings?.joinColumnName).toBe(
          'ownerPersonForMorphRelationId',
        );
        expect(createdField.name).toBe('ownerPersonForMorphRelation');
      } else {
        expect(createdField.settings?.joinColumnName).toBeUndefined();
        expect(createdField.name).toBe('ownerPeopleForMorphRelation');
      }
    },
  );
});
