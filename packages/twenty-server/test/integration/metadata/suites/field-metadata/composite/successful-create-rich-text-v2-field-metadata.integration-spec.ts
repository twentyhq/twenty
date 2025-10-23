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

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

const SUCCESSFUL_TEST_CASES: EachTestingContext<{
  input: Omit<CreateFieldInput, 'objectMetadataId' | 'type' | 'workspaceId'>;
}>[] = [
  {
    title:
      'rich text v2 field with basic metadata (name, label, description, icon)',
    context: {
      input: {
        name: 'description',
        label: 'Description',
        description: 'Rich text description field',
        icon: 'IconNotes',
      },
    },
  },
  {
    title: 'rich text v2 field with default value containing markdown',
    context: {
      input: {
        name: 'notes',
        label: 'Notes',
        defaultValue: {
          blocknote: null,
          markdown: "'# Default Title'",
        },
      },
    },
  },
  {
    title: 'rich text v2 field with default value containing blocknote',
    context: {
      input: {
        name: 'content',
        label: 'Content',
        defaultValue: {
          blocknote: '\'{"blocks":[{"type":"paragraph"}]}\'',
          markdown: null,
        },
      },
    },
  },
  {
    title: 'rich text v2 field with empty default value',
    context: {
      input: {
        name: 'body',
        label: 'Body',
        defaultValue: {
          blocknote: null,
          markdown: null,
        },
      },
    },
  },
];

describe('Rich text v2 field metadata creation tests suite', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string | undefined = undefined;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'testRichTextV2Object',
        namePlural: 'testRichTextV2Objects',
        labelSingular: 'Test Rich Text V2 Object',
        labelPlural: 'Test Rich Text V2 Objects',
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
    'it should create $title',
    async ({ context: { input } }) => {
      const inputPayload = {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.RICH_TEXT_V2,
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
          settings
        `,
      });

      createdFieldMetadataId = data.createOneField.id;

      const { objectMetadataId: _, ...expectedFields } = inputPayload;

      expect(data.createOneField).toMatchObject(expectedFields);
    },
  );
});
