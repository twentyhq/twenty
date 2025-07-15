import { faker } from '@faker-js/faker';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import {
  EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

type GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: string;
    sourceObjectId: string;
    opportunityObjectId: string;
  };
  collisionFieldLabel: string;
};
const globalTestContext: GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: '',
    sourceObjectId: '',
    opportunityObjectId: '',
  },
  collisionFieldLabel: 'collisionfieldlabel',
};

type TestedRelationCreationPayload = Partial<
  Omit<CreateFieldInput, 'relationCreationPayload'>
> & {
  relationCreationPayload?: Partial<
    CreateFieldInput['relationCreationPayload']
  >;
};

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  | TestedRelationCreationPayload
  | ((context: GlobalTestContext) => TestedRelationCreationPayload)
>[];
describe('Field metadata relation creation should fail', () => {
  const failingLabelsCreationTestsUseCase: CreateOneObjectMetadataItemTestingContext =
    [
      // TODO @prastoin add coverage other fields such as the Type, icon etc etc ( using edge cases fuzzing etc )
      {
        title: 'when targetFieldLabel is empty',
        context: { relationCreationPayload: { targetFieldLabel: '' } },
      },
      {
        title: 'when targetFieldLabel exceeds maximum length',
        context: {
          relationCreationPayload: { targetFieldLabel: 'A'.repeat(64) },
        },
      },
      {
        // Not handled gracefully should be refactored
        title: 'when targetObjectMetadataId is unknown',
        context: {
          relationCreationPayload: {
            targetObjectMetadataId: faker.string.uuid(),
          },
        },
      },
      {
        title: 'when targetFieldLabel contains only whitespace',
        context: { relationCreationPayload: { targetFieldLabel: '   ' } },
      },
      {
        title:
          'when targetFieldLabel conflicts with an existing field on target object metadata id',
        context: ({ collisionFieldLabel, objectMetadataIds }) => ({
          relationCreationPayload: {
            targetObjectMetadataId: objectMetadataIds.targetObjectId,
            targetFieldLabel: collisionFieldLabel,
          },
        }),
      },
      {
        title: 'when type is not provided',
        context: { relationCreationPayload: { type: undefined } },
      },
      {
        title: 'when type is a wrong value',
        context: { relationCreationPayload: { type: 'wrong' as RelationType } },
      },
      {
        only: true,
        title:
          'when field name conflicts with an existing join col on source object metadata id',
        context: ({ objectMetadataIds }) => ({
          objectMetadataId: objectMetadataIds.opportunityObjectId,
          name: 'companyId',
        }),
      },
      // {
      //   title:
      //     'when targetFieldLabel conflicts with an existing join col on target object metadata id',
      //   context: ({ objectMetadataIds }) => ({
      //     relationCreationPayload: {
      //       targetObjectMetadataId: objectMetadataIds.companyObjectId,
      //       targetFieldLabel: 'companyId',
      //     },
      //   }),
      // },
    ];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: sourceObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'collisionRelations',
        nameSingular: 'collisionRelation',
      }),
    });

    const {
      data: {
        createOneObject: { id: targetObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'collisionRelationTargets',
        nameSingular: 'collisionRelationTarget',
      }),
    });

    // Could this be replaced by a global id ?
    const { objects, errors } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: {
          first: 10000,
        },
      },
      gqlFields: `
    nameSingular,
    id
    `,
    });

    const opportunityObject = objects.find(
      (object) => object.nameSingular === 'opportunity',
    );
    if (!isDefined(opportunityObject)) {
      throw new Error(
        'Should never occur could not find a company object metadata',
      );
    }

    globalTestContext.objectMetadataIds = {
      sourceObjectId,
      targetObjectId,
      opportunityObjectId: opportunityObject.id,
    };

    const { data } = await createOneFieldMetadata({
      input: {
        objectMetadataId: targetObjectId,
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

  it.each(eachTestingContextFilter(failingLabelsCreationTestsUseCase))(
    'relation ONE_TO_MANY $title',
    async ({ context }) => {
      const computedContext =
        typeof context === 'function' ? context(globalTestContext) : context;

      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
          name: 'fieldname',
          label: 'Relation field',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.RELATION,
          ...computedContext,
          relationCreationPayload: {
            targetFieldLabel: 'defaultTargetFieldLabel',
            type: RelationType.ONE_TO_MANY,
            targetObjectMetadataId:
              globalTestContext.objectMetadataIds.targetObjectId,
            targetFieldIcon: 'IconBuildingSkyscraper',
            ...computedContext.relationCreationPayload,
          },
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );

  // it.each(failingLabelsCreationTestsUseCase)(
  //   'relation MANY_TO_ONE $title',
  //   async ({ context }) => {
  //     const computedContext =
  //       typeof context === 'function' ? context(globalTestContext) : context;

  //     const { errors } = await createOneFieldMetadata({
  //       expectToFail: true,
  //       input: {
  //         objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
  //         name: 'fieldname',
  //         label: 'Relation field',
  //         isLabelSyncedWithName: false,
  //         type: FieldMetadataType.RELATION,
  //         relationCreationPayload: {
  //           targetFieldLabel: 'defaultTargetFieldLabel',
  //           type: RelationType.MANY_TO_ONE,
  //           targetObjectMetadataId:
  //             globalTestContext.objectMetadataIds.targetObjectId,
  //           targetFieldIcon: 'IconBuildingSkyscraper',
  //           ...computedContext,
  //         },
  //       },
  //     });

  //     expect(errors).toBeDefined();
  //     expect(errors).toMatchSnapshot();
  //   },
  // );
});
