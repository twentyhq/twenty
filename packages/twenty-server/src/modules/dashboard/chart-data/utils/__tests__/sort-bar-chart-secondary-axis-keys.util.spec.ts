import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { sortBarChartSecondaryAxisKeys } from 'src/modules/dashboard/chart-data/utils/sort-bar-chart-secondary-axis-keys.util';

const buildConfiguration = (
  configuration: Partial<BarChartConfigurationDTO>,
): BarChartConfigurationDTO => configuration as BarChartConfigurationDTO;

const textGroupByField = {
  type: FieldMetadataType.TEXT,
} as FlatFieldMetadata;

const emptyLookup = new Map<string, RawDimensionValue>();

describe('sortBarChartSecondaryAxisKeys', () => {
  it('should return the keys untouched when no order by is configured', () => {
    const keys = ['b', 'a', 'c'];

    const result = sortBarChartSecondaryAxisKeys({
      keys,
      data: [],
      configuration: buildConfiguration({}),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['b', 'a', 'c']);
  });

  it('should sort keys alphabetically ascending', () => {
    const result = sortBarChartSecondaryAxisKeys({
      keys: ['charlie', 'alpha', 'bravo'],
      data: [],
      configuration: buildConfiguration({
        secondaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
      }),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['alpha', 'bravo', 'charlie']);
  });

  it('should sort keys alphabetically descending', () => {
    const result = sortBarChartSecondaryAxisKeys({
      keys: ['charlie', 'alpha', 'bravo'],
      data: [],
      configuration: buildConfiguration({
        secondaryAxisOrderBy: GraphOrderBy.FIELD_DESC,
      }),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['charlie', 'bravo', 'alpha']);
  });

  it('should sort by the summed value across every data row', () => {
    const result = sortBarChartSecondaryAxisKeys({
      keys: ['low', 'high'],
      data: [
        { low: 1, high: 10 },
        { low: 2, high: 20 },
      ],
      configuration: buildConfiguration({
        secondaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      }),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['high', 'low']);
  });

  it('should ignore non numeric cells when summing values', () => {
    const result = sortBarChartSecondaryAxisKeys({
      keys: ['a', 'b'],
      data: [
        { a: 5, b: 'not-a-number' },
        { a: 5, b: 1 },
      ],
      configuration: buildConfiguration({
        secondaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      }),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['a', 'b']);
  });

  it('should treat a key absent from the data as zero', () => {
    const result = sortBarChartSecondaryAxisKeys({
      keys: ['present', 'absent'],
      data: [{ present: 3 }],
      configuration: buildConfiguration({
        secondaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      }),
      secondaryFormattedToRawLookup: emptyLookup,
      secondarySelectOptions: null,
      secondaryAxisGroupByField: textGroupByField,
    });

    expect(result).toEqual(['present', 'absent']);
  });
});
