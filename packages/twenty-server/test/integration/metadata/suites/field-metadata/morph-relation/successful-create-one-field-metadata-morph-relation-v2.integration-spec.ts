import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';

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

const successfulTestCases: EachTestingContextArray = [
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

describe('successful createOne FieldMetadataService morph relation fields v2', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;
  let createdFieldMetadataId: string | undefined = undefined;

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
  });

  afterAll(async () => {
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

  it.each(eachTestingContextFilter(successfulTestCases))(
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
