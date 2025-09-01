import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { isDefined } from 'twenty-shared/utils';

describe('createOne FieldMetadataService morph relation fields', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const {
      data: {
        createOneObject: { id: objectMetadataPersonId },
      },
    } = await forceCreateOneObjectMetadata({
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
    } = await forceCreateOneObjectMetadata({
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
    } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'opportunityForMorphRelationSecond',
        namePlural: 'opportunitiesForMorphRelationSecond',
        labelSingular: 'Opportunity For Morph Relation',
        labelPlural: 'Opportunities For Morph Relation',
        icon: 'IconOpportunity',
      },
    });
    createdObjectMetadataOpportunityId = objectMetadataOpportunityId;
  });

  afterAll(async () => {
    await Promise.all(
      [
        createdObjectMetadataPersonId,
        createdObjectMetadataOpportunityId,
        createdObjectMetadataCompanyId,
      ].map(
        async (objectMetadataId) =>
          await updateOneObjectMetadata({
            expectToFail: false,
            input: {
              idToUpdate: objectMetadataId,
              updatePayload: { isActive: false },
            },
          }),
      ),
    );

    await Promise.all(
      [
        createdObjectMetadataPersonId,
        createdObjectMetadataOpportunityId,
        createdObjectMetadataCompanyId,
      ].map(
        async (objectMetadataId) =>
          await deleteOneObjectMetadata({
            expectToFail: false,
            input: { idToDelete: objectMetadataId },
          }),
      ),
    );

    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
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

    createdFieldMetadataId = undefined;
  });

  type EachTestingContextArray = EachTestingContext<
    (args: {
      createdObjectMetadataPersonId: string;
      createdObjectMetadataOpportunityId: string;
      createdObjectMetadataCompanyId: string;
    }) => Omit<
      CreateFieldInput,
      'morphRelationsCreationPayload' | 'workspaceId'
    > &
      Required<Pick<CreateFieldInput, 'morphRelationsCreationPayload'>>
  >[];

  const eachTestingContextArray: EachTestingContextArray = [
    {
      title: 'should create a MORPH_RELATION field type MANY_TO_ONE',
      context: ({
        createdObjectMetadataCompanyId,
        createdObjectMetadataOpportunityId,
        createdObjectMetadataPersonId,
      }) => ({
        label: 'field label',
        name: 'fieldName',
        objectMetadataId: createdObjectMetadataCompanyId,
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
      }),
    },
    {
      title: 'should create a MORPH_RELATION field type ONE_TO_MANY',
      context: ({
        createdObjectMetadataCompanyId,
        createdObjectMetadataOpportunityId,
        createdObjectMetadataPersonId,
      }) => ({
        label: 'field label',
        name: 'fieldName',
        objectMetadataId: createdObjectMetadataCompanyId,
        type: FieldMetadataType.MORPH_RELATION,
        morphRelationsCreationPayload: [
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'toto',
            targetObjectMetadataId: createdObjectMetadataOpportunityId,
            type: RelationType.ONE_TO_MANY,
          },
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'tata',
            targetObjectMetadataId: createdObjectMetadataPersonId,
            type: RelationType.ONE_TO_MANY,
          },
        ],
      }),
    },
  ];

  it.each(eachTestingContextFilter(eachTestingContextArray))(
    '$title',
    async ({ context }) => {
      const contextPayload = context({
        createdObjectMetadataOpportunityId,
        createdObjectMetadataPersonId,
        createdObjectMetadataCompanyId,
      });

      const {
        data: { createOneField: rawCreateOneField },
      } = await createOneFieldMetadata({
        input: contextPayload,
        expectToFail: false,
        gqlFields: `
            id
            name
            label
            isLabelSyncedWithName
            settings
            object {
              id
              nameSingular
            }
            morphRelations {
              type
              targetFieldMetadata {
                id
              }
              targetObjectMetadata {
                id
              }
              sourceFieldMetadata {
                id
              }
              sourceObjectMetadata {
                id
              }
            }
          `,
      });
      const createOneField = rawCreateOneField as FieldMetadataDTO & {
        morphRelations: RelationDTO[];
      };
      createdFieldMetadataId = createOneField.id;

      const expectedMorphRelations =
        contextPayload.morphRelationsCreationPayload.map(
          ({ targetObjectMetadataId, type }) => ({
            sourceFieldMetadata: {
              id: expect.any(String),
            },
            sourceObjectMetadata: {
              id: contextPayload.objectMetadataId,
            },
            targetFieldMetadata: {
              id: expect.any(String),
            },
            targetObjectMetadata: {
              id: targetObjectMetadataId,
            },
            type,
          }),
        );

      expect(createOneField.morphRelations).toMatchObject(
        expectedMorphRelations,
      );
    },
  );
});
