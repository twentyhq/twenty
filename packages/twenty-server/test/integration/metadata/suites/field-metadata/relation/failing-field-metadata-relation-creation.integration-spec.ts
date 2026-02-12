import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

type GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: string;
    sourceObjectId: string;
  };
  collisionFieldName: string;
  collisionFieldNameWithId: string;
  collisionFieldLabel: string;
  collisionFieldLabelWithId: string;
};
const globalTestContext: GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: '',
    sourceObjectId: '',
  },
  collisionFieldLabel: 'Field Name',
  collisionFieldName: 'fieldName',
  collisionFieldNameWithId: 'fieldNameBisId',
  collisionFieldLabelWithId: 'Field Name Bis Id',
};

type TestedRelationCreationPayload = Partial<
  NonNullable<CreateFieldInput['relationCreationPayload']>
>;

type TestedContext = {
  input: {
    name?: string;
    relationCreationPayload?: TestedRelationCreationPayload;
  };
};

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  TestedContext | ((context: GlobalTestContext) => TestedContext)
>[];
describe('Field metadata relation creation should fail', () => {
  const failingLabelsCreationTestsUseCase: CreateOneObjectMetadataItemTestingContext =
    [
      // TODO @prastoin add coverage other fields such as the Type, icon etc etc ( using edge cases fuzzing etc )
      {
        title: '(relationCreationPayload) when targetFieldLabel is empty',
        context: {
          input: { relationCreationPayload: { targetFieldLabel: '' } },
        },
      },
      {
        title:
          '(relationCreationPayload) when targetFieldLabel exceeds maximum length',
        context: {
          input: {
            relationCreationPayload: { targetFieldLabel: 'A'.repeat(64) },
          },
        },
      },
      {
        // Not handled gracefully should be refactored
        title:
          '(relationCreationPayload) when targetObjectMetadataId is unknown',
        context: {
          input: {
            relationCreationPayload: {
              targetObjectMetadataId: faker.string.uuid(),
            },
          },
        },
      },
      {
        title:
          '(relationCreationPayload) when targetFieldLabel contains only whitespace',
        context: {
          input: {
            relationCreationPayload: { targetFieldLabel: '   ' },
          },
        },
      },
      {
        title:
          '(relationCreationPayload) when targetFieldLabel conflicts with an existing field on target object metadata id',
        context: ({ collisionFieldLabel, objectMetadataIds }) => ({
          input: {
            relationCreationPayload: {
              targetObjectMetadataId: objectMetadataIds.targetObjectId,
              targetFieldLabel: collisionFieldLabel,
            },
          },
        }),
      },
      {
        title:
          '(relationCreationPayload) when targetFieldLabel conflicts with an existing {name}Id on target object metadata id',
        context: ({ collisionFieldLabelWithId, objectMetadataIds }) => ({
          input: {
            relationCreationPayload: {
              targetObjectMetadataId: objectMetadataIds.targetObjectId,
              targetFieldLabel: collisionFieldLabelWithId,
            },
          },
        }),
      },
      {
        title: '(relationCreationPayload) when type is not provided',
        context: {
          input: {
            relationCreationPayload: { type: undefined },
          },
        },
      },
      {
        title: '(relationCreationPayload) when type is a wrong value',
        context: {
          input: {
            relationCreationPayload: { type: 'wrong' as RelationType },
          },
        },
      },
      {
        title: 'when {name}Id is already used',
        context: ({ collisionFieldNameWithId }) => ({
          input: {
            name: collisionFieldNameWithId,
            relationCreationPayload: { targetFieldIcon: '' },
          },
        }),
      },
      {
        title:
          'when target and source are the same object and name are the same',
        context: {
          input: {
            name: 'relationName',
            relationCreationPayload: {
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.sourceObjectId,
              targetFieldLabel: 'Relation Name',
            },
          },
        },
      },
      {
        title:
          '(relationCreationPayload) when targetObjectMetadataId is not a valid uuid format',
        context: {
          input: {
            relationCreationPayload: {
              targetObjectMetadataId: 'not-a-valid-uuid',
            },
          },
        },
      },
      {
        title: 'when source field name conflicts with existing field name',
        context: ({ collisionFieldName }) => ({
          input: {
            name: collisionFieldName,
            relationCreationPayload: {
              targetFieldLabel: 'Unique Target Label',
            },
          },
        }),
      },
      {
        title:
          'when self-relation source field join column would conflict with target field name',
        context: {
          input: {
            name: 'parent',
            relationCreationPayload: {
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.sourceObjectId,
              targetFieldLabel: 'Parent Id',
            },
          },
        },
      },
      {
        title:
          'when self-relation target join column would conflict with source field name',
        context: {
          input: {
            name: 'childrenId',
            relationCreationPayload: {
              targetObjectMetadataId:
                globalTestContext.objectMetadataIds.sourceObjectId,
              targetFieldLabel: 'Children',
            },
          },
        },
      },
    ];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: sourceObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'sourceObjects',
        nameSingular: 'sourceObject',
      }),
    });

    const {
      data: {
        createOneObject: { id: targetObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'targetObjects',
        nameSingular: 'targetObject',
      }),
    });

    globalTestContext.objectMetadataIds = {
      sourceObjectId,
      targetObjectId,
    };

    const { data: collisionFieldWithLabelTargetData } =
      await createOneFieldMetadata({
        input: {
          objectMetadataId: targetObjectId,
          name: globalTestContext.collisionFieldName,
          label: 'LabelThatCouldBeAnything',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.TEXT,
        },
      });

    const { data: collisionFieldWithIdTargetData } =
      await createOneFieldMetadata({
        input: {
          objectMetadataId: targetObjectId,
          name: globalTestContext.collisionFieldNameWithId,
          label: 'LabelThatCouldBeAnything',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.TEXT,
        },
      });

    const { data: collisionFieldWithLabelSourceData } =
      await createOneFieldMetadata({
        input: {
          objectMetadataId: sourceObjectId,
          name: globalTestContext.collisionFieldName,
          label: 'LabelThatCouldBeAnything',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.TEXT,
        },
      });

    const { data: collisionFieldWithIdSourceData } =
      await createOneFieldMetadata({
        input: {
          objectMetadataId: sourceObjectId,
          name: globalTestContext.collisionFieldNameWithId,
          label: 'LabelThatCouldBeAnything',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.TEXT,
        },
      });

    expect(collisionFieldWithLabelTargetData).toBeDefined();
    expect(collisionFieldWithIdTargetData).toBeDefined();
    expect(collisionFieldWithLabelSourceData).toBeDefined();
    expect(collisionFieldWithIdSourceData).toBeDefined();
  });

  afterAll(async () => {
    for (const objectMetadataId of Object.values(
      globalTestContext.objectMetadataIds,
    )) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: {
            isActive: false,
          },
        },
      });
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
      const computedRelationCreationPayload =
        typeof context === 'function'
          ? context(globalTestContext).input.relationCreationPayload
          : context.input.relationCreationPayload;

      const computedName =
        typeof context === 'function'
          ? context(globalTestContext).input.name
          : context.input.name;

      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
          name: computedName ?? 'fieldname',
          label: 'Relation field',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.RELATION,
          relationCreationPayload: {
            targetFieldLabel: 'defaultTargetFieldLabel',
            type: RelationType.ONE_TO_MANY,
            targetObjectMetadataId:
              globalTestContext.objectMetadataIds.targetObjectId,
            targetFieldIcon: 'IconBuildingSkyscraper',
            ...computedRelationCreationPayload,
          },
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors),
      );
    },
  );

  it.each(eachTestingContextFilter(failingLabelsCreationTestsUseCase))(
    'relation MANY_TO_ONE $title',
    async ({ context }) => {
      const computedRelationCreationPayload =
        typeof context === 'function'
          ? context(globalTestContext).input.relationCreationPayload
          : context.input.relationCreationPayload;

      const computedName =
        typeof context === 'function'
          ? context(globalTestContext).input.name
          : context.input.name;

      const { errors } = await createOneFieldMetadata({
        expectToFail: true,
        input: {
          objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
          name: computedName ?? 'fieldname',
          label: 'Relation field',
          isLabelSyncedWithName: false,
          type: FieldMetadataType.RELATION,
          relationCreationPayload: {
            targetFieldLabel: 'defaultTargetFieldLabel',
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadataId:
              globalTestContext.objectMetadataIds.targetObjectId,
            targetFieldIcon: 'IconBuildingSkyscraper',
            ...computedRelationCreationPayload,
          },
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('should fail when creating MANY_TO_ONE self-relation with same field name and label', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
        name: 'manager',
        label: 'Manager',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Manager',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId:
            globalTestContext.objectMetadataIds.sourceObjectId,
          targetFieldIcon: 'IconUser',
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail when creating ONE_TO_MANY self-relation with same field name and label', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
        name: 'manager',
        label: 'Manager',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Manager',
          type: RelationType.ONE_TO_MANY,
          targetObjectMetadataId:
            globalTestContext.objectMetadataIds.sourceObjectId,
          targetFieldIcon: 'IconUser',
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail when creating a relation field with name that conflicts with existing field name', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
        name: globalTestContext.collisionFieldName,
        label: 'Duplicate Field',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Related Object',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId:
            globalTestContext.objectMetadataIds.targetObjectId,
          targetFieldIcon: 'IconLink',
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail when creating a relation field with name that conflicts with existing join column name', async () => {
    const relationFieldName = 'company';

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
        name: relationFieldName,
        label: 'Company',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'company',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId:
            globalTestContext.objectMetadataIds.targetObjectId,
          targetFieldIcon: 'IconBuilding',
        },
      },
    });

    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        objectMetadataId: globalTestContext.objectMetadataIds.sourceObjectId,
        name: `${relationFieldName}Id`,
        label: 'Company Id Field',
        isLabelSyncedWithName: false,
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetFieldLabel: 'Related',
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId:
            globalTestContext.objectMetadataIds.targetObjectId,
          targetFieldIcon: 'IconLink',
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
