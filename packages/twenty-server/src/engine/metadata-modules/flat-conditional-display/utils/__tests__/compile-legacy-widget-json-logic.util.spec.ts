import {
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';

import { LEGACY_WIDGET_JSON_LOGIC_CORPUS } from 'src/engine/metadata-modules/flat-conditional-display/__mocks__/legacy-widget-json-logic-corpus.mock';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';

const MULTI_SELECT_FIELD_ID = '20202020-1111-4111-8111-000000000001';
const SELECT_FIELD_ID = '20202020-1111-4111-8111-000000000002';
const TEXT_FIELD_ID = '20202020-1111-4111-8111-000000000003';

const FIELDS_BY_NAME: Record<
  string,
  { fieldMetadataId: string; type: FieldMetadataType }
> = {
  multiSelectField: {
    fieldMetadataId: MULTI_SELECT_FIELD_ID,
    type: FieldMetadataType.MULTI_SELECT,
  },
  selectField: {
    fieldMetadataId: SELECT_FIELD_ID,
    type: FieldMetadataType.SELECT,
  },
  textField: {
    fieldMetadataId: TEXT_FIELD_ID,
    type: FieldMetadataType.TEXT,
  },
};

const resolveField = (fieldName: string) => FIELDS_BY_NAME[fieldName];

describe('compileLegacyWidgetJsonLogic', () => {
  it.each(LEGACY_WIDGET_JSON_LOGIC_CORPUS)(
    'should convert %j into the same rows on the device or a known field every time',
    (jsonLogic) => {
      const conditionalDisplay = compileLegacyWidgetJsonLogic({
        jsonLogic,
        resolveField,
      });
      const { recordFilters = [] } = conditionalDisplay;

      expect(compileLegacyWidgetJsonLogic({ jsonLogic, resolveField })).toEqual(
        conditionalDisplay,
      );
      expect(recordFilters.length).toBeGreaterThan(0);
      recordFilters.forEach(({ contextKey, fieldMetadataId }) => {
        expect(['device', MULTI_SELECT_FIELD_ID, SELECT_FIELD_ID]).toContain(
          contextKey ?? fieldMetadataId,
        );
      });
    },
  );

  it('should turn a negated or of multi-select inclusions into ungrouped does-not-contain rows', () => {
    const values = ['VALUE_1', 'VALUE_2', 'VALUE_3'];

    expect(
      compileLegacyWidgetJsonLogic({
        jsonLogic: {
          '!': {
            or: values.map((value) => ({
              in: [value, { var: 'selectedRecords.0.multiSelectField' }],
            })),
          },
        },
        resolveField,
      }),
    ).toEqual({
      recordFilters: values.map((value) => ({
        id: expect.any(String),
        fieldMetadataId: MULTI_SELECT_FIELD_ID,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: JSON.stringify([value]),
      })),
    });
  });

  it.each([
    [{ and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }] }, 'DESKTOP'],
    [{ '==': [{ var: 'device' }, 'MOBILE'] }, 'MOBILE'],
  ] as const)(
    'should return the standard device rule for %j',
    (jsonLogic, device) => {
      expect(compileLegacyWidgetJsonLogic({ jsonLogic, resolveField })).toEqual(
        buildDeviceConditionalDisplay(device),
      );
    },
  );

  it('should build device rows inside compound json-logic like the standard device rule', () => {
    const { recordFilters = [] } = compileLegacyWidgetJsonLogic({
      jsonLogic: {
        and: [
          { '===': [{ var: 'device' }, 'MOBILE'] },
          { '==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_15'] },
        ],
      },
      resolveField,
    });
    const [standardDeviceRecordFilter] =
      buildDeviceConditionalDisplay('MOBILE').recordFilters ?? [];

    expect(recordFilters[0]).toEqual({
      ...standardDeviceRecordFilter,
      id: expect.any(String),
    });
  });

  it('should turn select comparisons into select rows grouped by their operator', () => {
    const conditionalDisplay = compileLegacyWidgetJsonLogic({
      jsonLogic: {
        or: [
          { '==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_15'] },
          { '!==': [{ var: 'selectedRecords.0.selectField' }, 'VALUE_16'] },
        ],
      },
      resolveField,
    });

    const rootRecordFilterGroupId =
      conditionalDisplay.recordFilterGroups?.[0]?.id;

    expect(conditionalDisplay).toEqual({
      recordFilters: [
        {
          id: expect.any(String),
          fieldMetadataId: SELECT_FIELD_ID,
          operand: ViewFilterOperand.IS,
          value: '["VALUE_15"]',
          recordFilterGroupId: rootRecordFilterGroupId,
          positionInRecordFilterGroup: 0,
        },
        {
          id: expect.any(String),
          fieldMetadataId: SELECT_FIELD_ID,
          operand: ViewFilterOperand.IS_NOT,
          value: '["VALUE_16"]',
          recordFilterGroupId: rootRecordFilterGroupId,
          positionInRecordFilterGroup: 1,
        },
      ],
      recordFilterGroups: [
        {
          id: rootRecordFilterGroupId,
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
    });
  });

  it.each([
    [
      { in: ['VALUE_1', { var: 'selectedRecords.0.textField' }] },
      'Cannot convert legacy widget json-logic',
    ],
    [{ '==': [1, 0] }, '{"==":[1,0]}'],
    [
      { in: ['VALUE_1', { var: 'selectedRecords.0.missingField' }] },
      'unknown field "missingField"',
    ],
    [
      { '!': { '===': [{ var: 'device' }, 'MOBILE'] } },
      'unsupported {"!":{"===":[{"var":"device"},"MOBILE"]}}',
    ],
  ])('should throw on %j', (jsonLogic, expectedMessage) => {
    expect(() =>
      compileLegacyWidgetJsonLogic({ jsonLogic, resolveField }),
    ).toThrow(expectedMessage);
  });
});
