import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';
import { determineChartItemColor } from 'src/modules/dashboard/chart-data/utils/determine-chart-item-color.util';

describe('determineChartItemColor', () => {
  const selectOptions = [
    { value: 'open', color: 'green' },
    { value: 'closed', color: 'red' },
    { value: 'pending', color: 'orange' },
  ];

  it('should return configuration color when provided', () => {
    const result = determineChartItemColor({
      configurationColor: GraphColor.BLUE,
      selectOptions,
      rawValue: 'open',
    });

    expect(result).toBe(GraphColor.BLUE);
  });

  it('should return select option color when no configuration color provided', () => {
    const result = determineChartItemColor({
      configurationColor: undefined,
      selectOptions,
      rawValue: 'open',
    });

    expect(result).toBe(GraphColor.GREEN);
  });

  it('should return undefined when no configuration color and no matching select option', () => {
    const result = determineChartItemColor({
      configurationColor: undefined,
      selectOptions,
      rawValue: 'unknown',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when no configuration color and no select options', () => {
    const result = determineChartItemColor({
      configurationColor: undefined,
      selectOptions: undefined,
      rawValue: 'open',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when no configuration color and null raw value', () => {
    const result = determineChartItemColor({
      configurationColor: undefined,
      selectOptions,
      rawValue: null,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when select option has no color', () => {
    const optionsWithoutColor = [{ value: 'open' }, { value: 'closed' }];

    const result = determineChartItemColor({
      configurationColor: undefined,
      selectOptions: optionsWithoutColor,
      rawValue: 'open',
    });

    expect(result).toBeUndefined();
  });

  it('should prioritize configuration color over select option color', () => {
    const result = determineChartItemColor({
      configurationColor: GraphColor.PURPLE,
      selectOptions,
      rawValue: 'open',
    });

    expect(result).toBe(GraphColor.PURPLE);
  });
});
