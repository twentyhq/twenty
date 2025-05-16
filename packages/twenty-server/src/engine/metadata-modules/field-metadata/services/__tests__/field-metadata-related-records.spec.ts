import { EachTestingContext } from 'twenty-shared/testing';

import { FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FieldMetadataRelatedRecordsService } from '../field-metadata-related-records.service';

type GetOptionsDifferencesTestContext = EachTestingContext<{
  oldOptions: (FieldMetadataDefaultOption)[];
  newOptions: (FieldMetadataDefaultOption)[];
  expected: {
    created: (FieldMetadataDefaultOption)[];
    updated: { old: FieldMetadataDefaultOption; new: FieldMetadataDefaultOption }[];
    deleted: (FieldMetadataDefaultOption)[];
  };
}>;

describe('FieldMetadataRelatedRecordsService', () => {
  describe('getOptionsDifferences', () => {
    let service: FieldMetadataRelatedRecordsService;
    let twentyORMGlobalManager: TwentyORMGlobalManager;

    beforeEach(() => {
      twentyORMGlobalManager = {} as TwentyORMGlobalManager;
      service = new FieldMetadataRelatedRecordsService(twentyORMGlobalManager);
    });

    const testCases: GetOptionsDifferencesTestContext[] = [
      {
        title: 'should identify created options',
        context: {
          oldOptions: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          ],
          newOptions: [
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
          oldOptions: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
          ],
          newOptions: [
            { id: '1', label: 'Option 1', value: 'updated-value1', position: 0 },
          ],
          expected: {
            created: [],
            updated: [
              {
                old: { id: '1', label: 'Option 1', value: 'value1', position: 0 },
                new: { id: '1', label: 'Option 1', value: 'updated-value1', position: 0 },
              },
            ],
            deleted: [],
          },
        },
      },
      {
        title: 'should identify deleted options',
        context: {
          oldOptions: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
          newOptions: [
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
          oldOptions: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
            { id: '3', label: 'Option 3', value: 'value3', position: 2 },
          ],
          newOptions: [
            { id: '1', label: 'Option 1', value: 'updated-value1', position: 0 },
            { id: '3', label: 'Option 3', value: 'value3', position: 1 },
            { id: '4', label: 'Option 4', value: 'value4', position: 2 },
          ],
          expected: {
            created: [
              { id: '4', label: 'Option 4', value: 'value4', position: 2 },
            ],
            updated: [
              {
                old: { id: '1', label: 'Option 1', value: 'value1', position: 0 },
                new: { id: '1', label: 'Option 1', value: 'updated-value1', position: 0 },
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
          oldOptions: [],
          newOptions: [],
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
          oldOptions: [],
          newOptions: [
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
          oldOptions: [
            { id: '1', label: 'Option 1', value: 'value1', position: 0 },
            { id: '2', label: 'Option 2', value: 'value2', position: 1 },
          ],
          newOptions: [],
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
        title: 'should not consider changes to label as updates when value remains the same',
        context: {
          oldOptions: [
            {
              id: "f86eaffd-b773-4c9a-957b-86dca4a62731",
              label: "Option 0",
              value: "option0",
              position: 1,
            },
            {
              id: "28d80b3c-79bd-4a1b-a868-9616534de0fa",
              label: "Option 1",
              value: "option1",
              position: 2,
            },
            {
              id: "25a05cd8-256f-4652-9e4a-6d9ca0b96f4d",
              label: "Option 2",
              value: "option2",
              position: 3,
            },
          ],
          newOptions: [
            {
              id: "f86eaffd-b773-4c9a-957b-86dca4a62731",
              label: "Option 0_UPDATED", // Label changed but value remains the same
              value: "option0",
              position: 1,
            },
            {
              id: "28d80b3c-79bd-4a1b-a868-9616534de0fa",
              label: "Option 1", // No change
              value: "option1",
              position: 2,
            },
            {
              id: "25a05cd8-256f-4652-9e4a-6d9ca0b96f4d",
              label: "Option 2_UPDATED", // Label changed but value remains the same
              value: "option2",
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
    ];

    test.each(testCases)('$title', ({ context: { oldOptions, newOptions, expected } }) => {
      // Access the private method using any type assertion
      const result = (service as any).getOptionsDifferences(oldOptions, newOptions);
      
      expect(result.created).toEqual(expected.created);
      expect(result.updated).toEqual(expected.updated);
      expect(result.deleted).toEqual(expected.deleted);
    });
  });
});
