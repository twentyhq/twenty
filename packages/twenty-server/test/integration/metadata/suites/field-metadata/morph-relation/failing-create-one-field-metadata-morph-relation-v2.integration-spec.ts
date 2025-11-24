import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

type FailingTestCases = EachTestingContext<
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

const morphCreationPayloadMalformedFailingTestCases: FailingTestCases = [
  {
    title: 'with empty morphRelationCreationPayload',
    context: ({ createdObjectMetadataCompanyId }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [],
    }),
  },
  {
    title: 'with undefined morphRelationCreationPayload',
    context: ({ createdObjectMetadataCompanyId }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: undefined as any,
    }),
  },
  {
    title: 'with null morphRelationCreationPayload',
    context: ({ createdObjectMetadataCompanyId }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: null as any,
    }),
  },
  {
    title: 'with not an array morphRelationCreationPayload',
    context: ({ createdObjectMetadataCompanyId }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: 'not-an-array' as any,
    }),
  },
  {
    title: 'with malformed morphRelationCreationPayload occurrence',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
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
        },
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'titi',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
];

const morphCreationPayloadFailingIntegrityValidationFailingTestCases: FailingTestCases =
  [
    {
      title: 'with many relation types',
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
            type: RelationType.ONE_TO_MANY,
          },
        ],
      }),
    },
    {
      title: 'on source object itself',
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
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'tata',
            targetObjectMetadataId: createdObjectMetadataCompanyId,
            type: RelationType.ONE_TO_MANY,
          },
        ],
      }),
    },
    {
      title: 'that has several references to same object',
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
          {
            targetFieldIcon: 'Icon123',
            targetFieldLabel: 'titi',
            targetObjectMetadataId: createdObjectMetadataOpportunityId,
            type: RelationType.ONE_TO_MANY,
          },
        ],
      }),
    },
  ];

const relationCreationPayloadEdgeCasesFailingTestsCases: FailingTestCases = [
  {
    title: 'when targetFieldLabel is empty',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: '',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
  {
    title: 'when targetFieldLabel exceeds maximum length',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'A'.repeat(64),
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
  {
    title: 'when targetObjectMetadataId is unknown',
    context: ({ createdObjectMetadataCompanyId }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'test',
          targetObjectMetadataId: faker.string.uuid(),
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
  {
    title: 'when targetFieldLabel contains only whitespace',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: '   ',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
  {
    title:
      'when targetFieldLabel has a first degree conflicts with an existing field on target object metadata id',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'name',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: RelationType.ONE_TO_MANY,
        },
      ],
    }),
  },
  {
    title: 'when type is not provided',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'test',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: undefined as unknown as RelationType,
        },
      ],
    }),
  },
  {
    title: 'when type is a wrong value',
    context: ({
      createdObjectMetadataCompanyId,
      createdObjectMetadataOpportunityId,
    }) => ({
      label: 'field label',
      name: 'fieldName',
      objectMetadataId: createdObjectMetadataCompanyId,
      type: FieldMetadataType.MORPH_RELATION,
      morphRelationsCreationPayload: [
        {
          targetFieldIcon: 'Icon123',
          targetFieldLabel: 'test',
          targetObjectMetadataId: createdObjectMetadataOpportunityId,
          type: 'wrong' as RelationType,
        },
      ],
    }),
  },
];

const failingTestCases: FailingTestCases = [
  ...morphCreationPayloadMalformedFailingTestCases,
  ...morphCreationPayloadFailingIntegrityValidationFailingTestCases,
  ...relationCreationPayloadEdgeCasesFailingTestsCases,
];

describe('failing createOne FieldMetadataService morph relation fields v2', () => {
  let createdObjectMetadataPersonId: string;
  let createdObjectMetadataOpportunityId: string;
  let createdObjectMetadataCompanyId: string;

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

  it.each(eachTestingContextFilter(failingTestCases))(
    'it should fail to create a MORPH_RELATION field $title',
    async ({ context }) => {
      const contextPayload = context({
        createdObjectMetadataOpportunityId,
        createdObjectMetadataPersonId,
        createdObjectMetadataCompanyId,
      });

      const { errors } = await createOneFieldMetadata({
        input: contextPayload,
        expectToFail: true,
      });

      expect(errors.length).toBe(1);
      const [firstError] = errors;

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
      expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    },
  );

  describe('Morh relation collision tests suite', () => {
    beforeAll(async () => {
      const morphRelationCreateFieldInput: Omit<
        CreateFieldInput,
        'workspaceId'
      > = {
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
      };

      await createOneFieldMetadata({
        input: morphRelationCreateFieldInput,
        expectToFail: false,
        gqlFields: `
      id
      name
      `,
      });
    });

    it('it should fail to create a field with name than result in existing morph relation field join column', async () => {
      const { errors } = await createOneFieldMetadata({
        input: {
          label: 'colliding field label',
          name: `fieldNamePersonForMorphRelationSecondId`,
          objectMetadataId: createdObjectMetadataCompanyId,
          type: FieldMetadataType.TEXT,
        },
        expectToFail: true,
      });

      expect(errors.length).toBe(1);
      const [firstError] = errors;

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
      expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    });

    it('it should fail to create a already existing morph relation with samefield', async () => {
      const morphRelationCreateFieldInput: Omit<
        CreateFieldInput,
        'workspaceId'
      > = {
        label: 'field label',
        name: 'differentFromExisting',
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
      };

      const { errors } = await createOneFieldMetadata({
        input: morphRelationCreateFieldInput,
        expectToFail: true,
        gqlFields: `
      id
      name
      `,
      });

      expect(errors.length).toBe(1);
      const [firstError] = errors;

      expect(firstError).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(firstError),
      );
      expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
