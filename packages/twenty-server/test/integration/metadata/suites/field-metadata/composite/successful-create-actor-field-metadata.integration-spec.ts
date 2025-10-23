import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
    type EachTestingContext,
    eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';

const SUCCESSFUL_TEST_CASES: EachTestingContext<{
  input: Omit<CreateFieldInput, 'objectMetadataId' | 'type' | 'workspaceId'>;
}>[] = [
  {
    title: 'actor field with basic configuration',
    context: {
      input: {
        name: 'processedBy',
        label: 'Processed By',
      },
    },
  },
  {
    title: 'actor field with description',
    context: {
      input: {
        name: 'modifiedBy',
        label: 'Modified By',
        description: 'Last person who modified this record',
      },
    },
  },
  {
    title: 'actor field with icon',
    context: {
      input: {
        name: 'assignedTo',
        label: 'Assigned To',
        icon: 'IconUser',
      },
    },
  },
];

describe('Actor field metadata creation tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testActorObject',
        namePlural: 'testActorObjects',
        labelSingular: 'Test Actor Object',
        labelPlural: 'Test Actor Objects',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  afterEach(async () => {
    if (createdFieldMetadataId) {
      await updateOneFieldMetadata({
        input: {
          updatePayload: { isActive: false },
          idToUpdate: createdFieldMetadataId,
        },
        expectToFail: false,
      });
      await deleteOneFieldMetadata({
        input: { idToDelete: createdFieldMetadataId },
        expectToFail: false,
      });
      createdFieldMetadataId = undefined;
    }
  });

  test.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'It should create $title',
    async ({ context: { input } }) => {
      const inputPayload = {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.ACTOR,
        isLabelSyncedWithName: false,
        ...input,
      };
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: inputPayload,
        gqlFields: `
          id
          type
          name
          label
          description
          icon
          defaultValue
          isLabelSyncedWithName
        `,
      });

      createdFieldMetadataId = data.createOneField.id;

      const { objectMetadataId: _omit, ...expectedFields } = inputPayload;
      expect(data.createOneField).toMatchObject(expectedFields);
    },
  );
});
