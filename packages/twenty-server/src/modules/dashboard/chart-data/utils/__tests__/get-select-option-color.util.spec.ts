import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';
import { getSelectOptionColorForValue } from 'src/modules/dashboard/chart-data/utils/get-select-option-color.util';

describe('getSelectOptionColorForValue', () => {
  const selectOptions = [
    { value: 'open', color: 'green' },
    { value: 'closed', color: 'red' },
    { value: 'pending', color: 'orange' },
    { value: 'no-color' },
    { value: 'invalid-color', color: 'not-a-valid-color' },
  ];

  it('should return color for matching select option', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'open',
      selectOptions,
    });

    expect(result).toBe(GraphColor.GREEN);
  });

  it('should return undefined when rawValue is null', () => {
    const result = getSelectOptionColorForValue({
      rawValue: null,
      selectOptions,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when rawValue is undefined', () => {
    const result = getSelectOptionColorForValue({
      rawValue: undefined,
      selectOptions,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when selectOptions is null', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'open',
      selectOptions: null,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when selectOptions is undefined', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'open',
      selectOptions: undefined,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when no matching option found', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'unknown',
      selectOptions,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when option has no color', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'no-color',
      selectOptions,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when option has invalid color', () => {
    const result = getSelectOptionColorForValue({
      rawValue: 'invalid-color',
      selectOptions,
    });

    expect(result).toBeUndefined();
  });

  it('should return correct color for different options', () => {
    expect(
      getSelectOptionColorForValue({
        rawValue: 'closed',
        selectOptions,
      }),
    ).toBe(GraphColor.RED);

    expect(
      getSelectOptionColorForValue({
        rawValue: 'pending',
        selectOptions,
      }),
    ).toBe(GraphColor.ORANGE);
  });
});
