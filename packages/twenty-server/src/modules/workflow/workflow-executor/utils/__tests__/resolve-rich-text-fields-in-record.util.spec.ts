import { FieldMetadataType } from 'twenty-shared/types';

import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';

jest.mock(
  'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util',
  () => ({
    findManyFlatEntityByIdInFlatEntityMaps: jest.fn().mockReturnValue([
      { type: FieldMetadataType.RICH_TEXT, name: 'summary' },
    ]),
  }),
);

describe('resolveRichTextFieldsInRecord', () => {
  it('should resolve variables in rich-text blocknote values', () => {
    const resolvedRecord = resolveRichTextFieldsInRecord(
      {
        summary: {
          blocknote: 'Hello {{trigger.name}}',
        },
      },
      {
        flatObjectMetadata: { fieldIds: ['summary-field-id'] },
        flatFieldMetadataMaps: {},
      } as never,
      {
        trigger: { name: 'Ada' },
      },
    );

    expect(resolvedRecord).toEqual({
      summary: {
        blocknote: 'Hello Ada',
      },
    });
  });

  it('should keep string values untouched for rich-text fields', () => {
    const resolvedRecord = resolveRichTextFieldsInRecord(
      {
        summary: '{{step_1.summary}}',
      },
      {
        flatObjectMetadata: { fieldIds: ['summary-field-id'] },
        flatFieldMetadataMaps: {},
      } as never,
      {
        step_1: { summary: 'From previous step' },
      },
    );

    expect(resolvedRecord).toEqual({
      summary: '{{step_1.summary}}',
    });
  });
});
