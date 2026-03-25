import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import {
  type CompareToFlatFieldMetadataEnumOptionsArgs,
  compareTwoFlatFieldMetadataEnumOptions,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata-enum-options.util';

type GetOptionsDifferencesTestContext = EachTestingContext<
  CompareToFlatFieldMetadataEnumOptionsArgs & {
    expected: {
      created: FieldMetadataDefaultOption[];
      updated: {
        from: FieldMetadataDefaultOption;
        to: FieldMetadataDefaultOption;
      }[];
      deleted: FieldMetadataDefaultOption[];
    };
  }
>;

describe('compareTwoFlatFieldMetadataEnumOptions', () => {
  const testCases: GetOptionsDifferencesTestContext[] = [
    {
      title: 'should identify created options',
      context: {
        compareLabel: false,
        fromOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
        ],
        toOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          { id: '2', label: 'Option 2', value: 'value2', position: 1 },
        ],
        expected: {
          created: [
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
          updated: [],
          deleted: [],
        },
      },
    },
    {
      title: 'should identify updated options',
      context: {
        compareLabel: false,
        fromOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
        ],
        toOptions: [
          {
            id: '1',
            label: 'Option 1',
            value: 'updated-value1',
            position: 0,
          },
        ],
        expected: {
          created: [],
          updated: [
            {
              from: {
                id: '1',
                label: 'Option 1',
                value: 'value1',
                position: 0,
              },
              to: {
                id: '1',
                label: 'Option 1',
                value: 'updated-value1',
                position: 0,
              },
            },
          ],
          deleted: [],
        },
      },
    },
    {
      title: 'should identify deleted options',
      context: {
        compareLabel: false,
        fromOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          { id: '2', label: 'Option 2', value: 'value2', position: 1 },
        ],
        toOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
        ],
        expected: {
          created: [],
          updated: [],
          deleted: [
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
        },
      },
    },
    {
      title: 'should identify all types of changes',
      context: {
        compareLabel: false,
        fromOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          { id: '3', label: 'Option 3', value: 'value3', position: 2 },
        ],
        toOptions: [
          {
            id: '1',
            label: 'Option 1',
            value: 'updated-value1',
            position: 0,
          },
          { id: '3', label: 'Option 3', value: 'value3', position: 1 },
          { id: '4', label: 'Option 4', value: 'value4', position: 2 },
        ],
        expected: {
          created: [
            { id: '4', label: 'Option 4', value: 'value4', position: 2 },
          ],
          updated: [
            {
              from: {
                id: '1',
                label: 'Option 1',
                value: 'value1',
                position: 0,
              },
              to: {
                id: '1',
                label: 'Option 1',
                value: 'updated-value1',
                position: 0,
              },
            },
          ],
          deleted: [
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
        },
      },
    },
    {
      title: 'should handle empty arrays',
      context: {
        compareLabel: false,
        fromOptions: [],
        toOptions: [],
        expected: {
          created: [],
          updated: [],
          deleted: [],
        },
      },
    },
    {
      title: 'should handle all new options',
      context: {
        compareLabel: false,
        fromOptions: [],
        toOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          { id: '2', label: 'Option 2', value: 'value2', position: 1 },
        ],
        expected: {
          created: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
          updated: [],
          deleted: [],
        },
      },
    },
    {
      title: 'should handle all deleted options',
      context: {
        compareLabel: false,
        fromOptions: [
          { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          { id: '2', label: 'Option 2', value: 'value2', position: 1 },
        ],
        toOptions: [],
        expected: {
          created: [],
          updated: [],
          deleted: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
        },
      },
    },
    {
      title:
        'should not consider changes to label as updates when value remains the same',
      context: {
        compareLabel: false,
        fromOptions: [
          {
            id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
            label: 'Option 0',
            value: 'option0',
            position: 1,
          },
          {
            id: '28d80b3c-79bd-4a1b-a868-9616534de0fa',
            label: 'Option 1',
            value: 'option1',
            position: 2,
          },
          {
            id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
            label: 'Option 2',
            value: 'option2',
            position: 3,
          },
        ],
        toOptions: [
          {
            id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
            label: 'Option 0_UPDATED', // Label changed but value remains the same
            value: 'option0',
            position: 1,
          },
          {
            id: '28d80b3c-79bd-4a1b-a868-9616534de0fa',
            label: 'Option 1', // No change
            value: 'option1',
            position: 2,
          },
          {
            id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
            label: 'Option 2_UPDATED', // Label changed but value remains the same
            value: 'option2',
            position: 3,
          },
        ],
        expected: {
          created: [],
          updated: [], // No updates because only labels changed, not values
          deleted: [],
        },
      },
    },
    {
      title:
        'should consider changes to label as updates when value remains the same if compareLabel is true',
      context: {
        fromOptions: [
          {
            id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
            label: 'Option 0',
            value: 'option0',
            position: 1,
          },
          {
            id: '28d80b3c-79bd-4a1b-a868-9616534de0fa',
            label: 'Option 1',
            value: 'option1',
            position: 2,
          },
          {
            id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
            label: 'Option 2',
            value: 'option2',
            position: 3,
          },
        ],
        toOptions: [
          {
            id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
            label: 'Option 0_UPDATED', // Label changed but value remains the same
            value: 'option0',
            position: 1,
          },
          {
            id: '28d80b3c-79bd-4a1b-a868-9616534de0fa',
            label: 'Option 1', // No change
            value: 'option1',
            position: 2,
          },
          {
            id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
            label: 'Option 2_UPDATED', // Label changed but value remains the same
            value: 'option2',
            position: 3,
          },
        ],
        expected: {
          created: [],
          updated: [
            {
              to: {
                id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
                label: 'Option 0_UPDATED',
                position: 1,
                value: 'option0',
              },
              from: {
                id: 'f86eaffd-b773-4c9a-957b-86dca4a62731',
                label: 'Option 0',
                position: 1,
                value: 'option0',
              },
            },
            {
              to: {
                id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
                label: 'Option 2_UPDATED',
                position: 3,
                value: 'option2',
              },
              from: {
                id: '25a05cd8-256f-4652-9e4a-6d9ca0b96f4d',
                label: 'Option 2',
                position: 3,
                value: 'option2',
              },
            },
          ],
          deleted: [],
        },
        compareLabel: true,
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({ context: { fromOptions, toOptions, expected, compareLabel } }) => {
      const result = compareTwoFlatFieldMetadataEnumOptions({
        compareLabel: compareLabel ?? false,
        fromOptions: fromOptions,
        toOptions: toOptions,
      });

      expect(result.created).toEqual(expected.created);
      expect(result.updated).toEqual(expected.updated);
      expect(result.deleted).toEqual(expected.deleted);
    },
  );
});
