import { FieldMetadataType, FirstDayOfTheWeek } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { processTwoDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-two-dimensional-results.util';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const userTimezone = 'UTC';
const firstDayOfTheWeek = FirstDayOfTheWeek.MONDAY;

describe('processTwoDimensionalResults', () => {
  const relationFieldMetadata = createMockFieldMetadata({
    name: 'agent',
    type: FieldMetadataType.RELATION,
  });
  const selectFieldMetadata = createMockFieldMetadata({
    name: 'status',
    type: FieldMetadataType.SELECT,
    options: [{ value: 'open', label: 'Open', color: 'green', position: 0 }],
  } as Partial<FlatFieldMetadata>);

  it('should keep two records resolving to distinct labels as distinct data points', () => {
    const { processedDataPoints, formattedToRawLookup } =
      processTwoDimensionalResults({
        rawResults: [
          {
            groupByDimensionValues: ['agent-id-1', 'open'],
            aggregateValue: 12,
          },
          {
            groupByDimensionValues: ['agent-id-2', 'open'],
            aggregateValue: 7,
          },
        ],
        primaryAxisGroupByField: relationFieldMetadata,
        secondaryAxisGroupByField: selectFieldMetadata,
        userTimezone,
        firstDayOfTheWeek,
        primaryRelationLabelResolution: {
          labelByRecordId: new Map([
            ['agent-id-1', 'John Smith (1)'],
            ['agent-id-2', 'John Smith (2)'],
          ]),
          unresolvedRecordIds: new Set(),
        },
        secondaryRelationLabelResolution: undefined,
      });

    expect(processedDataPoints).toHaveLength(2);
    expect(processedDataPoints[0].xFormatted).toBe('John Smith (1)');
    expect(processedDataPoints[1].xFormatted).toBe('John Smith (2)');
    expect(processedDataPoints[0].aggregateValue).toBe(12);
    expect(processedDataPoints[1].aggregateValue).toBe(7);
    expect(formattedToRawLookup.size).toBe(2);
    expect(formattedToRawLookup.get('John Smith (1)')).toBe('agent-id-1');
    expect(formattedToRawLookup.get('John Smith (2)')).toBe('agent-id-2');
  });

  it('should resolve secondary axis relation labels independently', () => {
    const { processedDataPoints, secondaryFormattedToRawLookup } =
      processTwoDimensionalResults({
        rawResults: [
          {
            groupByDimensionValues: ['open', 'agent-id-1'],
            aggregateValue: 3,
          },
        ],
        primaryAxisGroupByField: selectFieldMetadata,
        secondaryAxisGroupByField: relationFieldMetadata,
        userTimezone,
        firstDayOfTheWeek,
        primaryRelationLabelResolution: undefined,
        secondaryRelationLabelResolution: {
          labelByRecordId: new Map([['agent-id-1', 'Alice']]),
          unresolvedRecordIds: new Set(),
        },
      });

    expect(processedDataPoints[0].xFormatted).toBe('Open');
    expect(processedDataPoints[0].yFormatted).toBe('Alice');
    expect(secondaryFormattedToRawLookup.get('Alice')).toBe('agent-id-1');
  });

  it('should keep raw values untouched without a resolution', () => {
    const { processedDataPoints } = processTwoDimensionalResults({
      rawResults: [
        {
          groupByDimensionValues: ['agent-id-1', 'open'],
          aggregateValue: 5,
        },
      ],
      primaryAxisGroupByField: relationFieldMetadata,
      secondaryAxisGroupByField: selectFieldMetadata,
      userTimezone,
      firstDayOfTheWeek,
      primaryRelationLabelResolution: undefined,
      secondaryRelationLabelResolution: undefined,
    });

    expect(processedDataPoints[0].xFormatted).toBe('agent-id-1');
  });
});
