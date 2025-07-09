import { faker } from '@faker-js/faker/.';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

type GlobalTestContext = {
  objectMetadataIds: {
    firstTargetObjectId: string;
    secondTargetObjectId: string;
    sourceObjectId: string;
  };
  targetFieldLabel: string;
  type: FieldMetadataType;
  targetFieldIcon: string;
  collisionFieldLabel: string;
};
const globalTestContext: GlobalTestContext = {
  objectMetadataIds: {
    firstTargetObjectId: '',
    secondTargetObjectId: '',
    sourceObjectId: '',
  },
  targetFieldLabel: 'defaultTargetFieldLabel',
  type: FieldMetadataType.MORPH_RELATION,
  targetFieldIcon: 'IconBuildingSkyscraper',
  collisionFieldLabel: 'collisionfieldlabel',
};

type TestedRelationCreationPayload = Partial<
  NonNullable<CreateFieldInput['relationCreationPayload']>
>;

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  | TestedRelationCreationPayload
  | ((context: GlobalTestContext) => TestedRelationCreationPayload)
>[];
describe('Field metadata morph relation creation should fail', () => {
  const failingLabelsCreationTestsUseCase: CreateOneObjectMetadataItemTestingContext =
    [
      {
        title: 'when targetFieldLabel is empty',
        context: { targetFieldLabel: '' },
      },
      {
        title: 'when targetFieldLabel exceeds maximum length',
        context: {
          targetFieldLabel: 'A'.repeat(64),
        },
      },
      {
        // Not handled gracefully should be refactored
        title: 'when targetObjectMetadataId is unknown',
        context: {
          targetObjectMetadataId: faker.string.uuid(),
        },
      },
      {
        title: 'when targetFieldLabel contains only whitespace',
        context: { targetFieldLabel: '   ' },
      },
      {
        title:
          'when targetFieldLabel conflicts with an existing field on target object metadata id',
        context: ({ collisionFieldLabel }) => ({
          targetFieldLabel: collisionFieldLabel,
        }),
      },
      {
        title: 'when type is not provided',
        context: { type: undefined },
      },
      {
        title: 'when type is a wrong value',
        context: { type: 'wrong' as RelationType },
      },
    ];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: sourceObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'sourceRelations',
        nameSingular: 'sourceRelation',
      }),
    });

    const {
      data: {
        createOneObject: { id: firstTargetObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'firstTargetRelations',
        nameSingular: 'firstTargetRelation',
      }),
    });

    const {
      data: {
        createOneObject: { id: secondTargetObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'secondTargetRelations',
        nameSingular: 'secondTargetRelation',
      }),
    });

    globalTestContext.objectMetadataIds = {
      sourceObjectId,
      firstTargetObjectId,
      secondTargetObjectId,
    };

    const { data } = await createOneFieldMetadata({
      input: {
        objectMetadataId: firstTargetObjectId,
        name: globalTestContext.collisionFieldLabel,
        label: 'LabelThatCouldBeAnything',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.TEXT,
      },
    });

    expect(data).toBeDefined();
  });

  afterAll(async () => {
    for (const objectMetadataId of Object.values(
      globalTestContext.objectMetadataIds,
    )) {
      await deleteOneObjectMetadata({
        input: {
          idToDelete: objectMetadataId,
        },
      });
    }
  });

  it.each(failingLabelsCreationTestsUseCase)(
    'relation ONE_TO_MANY $title',
    async ({ context }) => {
      const computedContext =
        typeof context === 'function' ? context(globalTestContext) : context;

      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
          name: 'owner',
          label: 'owner field',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.MORPH_RELATION,
          morphRelationsCreationPayload: [
            {
              targetFieldLabel: 'defaultFirstTargetFieldLabel',
              type: RelationType.ONE_TO_MANY,
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.firstTargetObjectId,
              targetFieldIcon: 'IconBuildingSkyscraper',
              ...computedContext,
            },
            {
              targetFieldLabel: 'defaultSecondTargetFieldLabel',
              type: RelationType.ONE_TO_MANY,
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.secondTargetObjectId,
              targetFieldIcon: 'IconBuildingSkyscraper',
              ...computedContext,
            },
          ],
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );

  it.each(failingLabelsCreationTestsUseCase)(
    'relation MANY_TO_ONE $title',
    async ({ context }) => {
      const computedContext =
        typeof context === 'function' ? context(globalTestContext) : context;

      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
          name: 'owner',
          label: 'owner field',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.MORPH_RELATION,
          morphRelationsCreationPayload: [
            {
              targetFieldLabel: 'defaultFirstTargetFieldLabel',
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.firstTargetObjectId,
              targetFieldIcon: 'IconBuildingSkyscraper',
              ...computedContext,
            },
            {
              targetFieldLabel: 'defaultSecondTargetFieldLabel',
              type: RelationType.MANY_TO_ONE,
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.secondTargetObjectId,
              targetFieldIcon: 'IconBuildingSkyscraper',
              ...computedContext,
            },
          ],
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );
});
