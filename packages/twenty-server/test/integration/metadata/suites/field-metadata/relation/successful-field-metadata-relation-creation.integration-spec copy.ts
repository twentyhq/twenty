import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';


import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: string;
    sourceObjectId: string;
  };
};
const globalTestContext: GlobalTestContext = {
  objectMetadataIds: {
    targetObjectId: '',
    sourceObjectId: '',
  },
};

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  | Partial<CreateFieldInput>
  | ((context: GlobalTestContext) => Partial<CreateFieldInput>)
>[];
describe('Field metadata relation creation should fail', () => {
  const successfulCreationTestCases: CreateOneObjectMetadataItemTestingContext =
    [{
      context: {
        name: '',
        relationCreationPayload: {
          targetFieldIcon: '',
          targetFieldLabel: 'label',
          targetObjectMetadataId: 'PUT COMPANY ID',
          type: RelationType.ONE_TO_MANY
        }
      },
      'title': "First test",
    }];

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: sourceObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'sources',
        nameSingular: 'source',
      }),
    });

    const {
      data: {
        createOneObject: { id: targetObjectId },
      },
    } = await createOneObjectMetadata({
      input: getMockCreateObjectInput({
        namePlural: 'tarets',
        nameSingular: 'target',
      }),
    });

    globalTestContext.objectMetadataIds = {
      sourceObjectId,
      targetObjectId,
    };
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

  it.each(successfulCreationTestCases)(
    'relation MANY_TO_ONE $title',
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
        },
      });

      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );
});
