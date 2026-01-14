import { GraphColorMode } from 'src/modules/dashboard/chart-data/types/graph-color-mode.enum';
import { determineGraphColorMode } from 'src/modules/dashboard/chart-data/utils/determine-graph-color-mode.util';

describe('determineGraphColorMode', () => {
  const selectFieldOptions = [
    { value: 'open', color: 'green' },
    { value: 'closed', color: 'red' },
  ];

  it('should return EXPLICIT_SINGLE_COLOR when configuration color is provided', () => {
    const result = determineGraphColorMode({
      configurationColor: 'blue',
      selectFieldOptions,
    });

    expect(result).toBe(GraphColorMode.EXPLICIT_SINGLE_COLOR);
  });

  it('should return SELECT_FIELD_OPTION_COLORS when no config color but has select options', () => {
    const result = determineGraphColorMode({
      configurationColor: undefined,
      selectFieldOptions,
    });

    expect(result).toBe(GraphColorMode.SELECT_FIELD_OPTION_COLORS);
  });

  it('should return AUTOMATIC_PALETTE when no config color and no select options', () => {
    const result = determineGraphColorMode({
      configurationColor: undefined,
      selectFieldOptions: undefined,
    });

    expect(result).toBe(GraphColorMode.AUTOMATIC_PALETTE);
  });

  it('should return AUTOMATIC_PALETTE when no config color and empty select options', () => {
    const result = determineGraphColorMode({
      configurationColor: undefined,
      selectFieldOptions: [],
    });

    expect(result).toBe(GraphColorMode.AUTOMATIC_PALETTE);
  });

  it('should return AUTOMATIC_PALETTE when config color is "auto"', () => {
    const result = determineGraphColorMode({
      configurationColor: 'auto',
      selectFieldOptions,
    });

    expect(result).toBe(GraphColorMode.SELECT_FIELD_OPTION_COLORS);
  });

  it('should return AUTOMATIC_PALETTE when config color is "auto" and no select options', () => {
    const result = determineGraphColorMode({
      configurationColor: 'auto',
      selectFieldOptions: undefined,
    });

    expect(result).toBe(GraphColorMode.AUTOMATIC_PALETTE);
  });

  it('should handle null configuration color', () => {
    const result = determineGraphColorMode({
      configurationColor: null,
      selectFieldOptions,
    });

    expect(result).toBe(GraphColorMode.SELECT_FIELD_OPTION_COLORS);
  });

  it('should handle null select field options', () => {
    const result = determineGraphColorMode({
      configurationColor: 'blue',
      selectFieldOptions: null,
    });

    expect(result).toBe(GraphColorMode.EXPLICIT_SINGLE_COLOR);
  });
});
