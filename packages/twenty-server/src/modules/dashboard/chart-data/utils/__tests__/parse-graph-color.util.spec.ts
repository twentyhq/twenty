import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';
import { parseGraphColor } from 'src/modules/dashboard/chart-data/utils/parse-graph-color.util';

describe('parseGraphColor', () => {
  it('should return valid GraphColor for valid lowercase color string', () => {
    expect(parseGraphColor('red')).toBe(GraphColor.RED);
    expect(parseGraphColor('blue')).toBe(GraphColor.BLUE);
    expect(parseGraphColor('green')).toBe(GraphColor.GREEN);
    expect(parseGraphColor('purple')).toBe(GraphColor.PURPLE);
  });

  it('should return undefined for null value', () => {
    expect(parseGraphColor(null)).toBeUndefined();
  });

  it('should return undefined for undefined value', () => {
    expect(parseGraphColor(undefined)).toBeUndefined();
  });

  it('should return undefined for "auto" value', () => {
    expect(parseGraphColor('auto')).toBeUndefined();
  });

  it('should return undefined for invalid color string', () => {
    expect(parseGraphColor('invalid-color')).toBeUndefined();
    expect(parseGraphColor('notacolor')).toBeUndefined();
    expect(parseGraphColor('#FF0000')).toBeUndefined();
  });

  it('should be case insensitive and normalize to uppercase', () => {
    expect(parseGraphColor('RED')).toBe(GraphColor.RED);
    expect(parseGraphColor('Blue')).toBe(GraphColor.BLUE);
    expect(parseGraphColor('GREEN')).toBe(GraphColor.GREEN);
    expect(parseGraphColor('red')).toBe(GraphColor.RED);
  });

  it('should return valid GraphColor for all supported colors', () => {
    const validColors = [
      'red',
      'ruby',
      'crimson',
      'tomato',
      'orange',
      'amber',
      'yellow',
      'lime',
      'grass',
      'green',
      'jade',
      'mint',
      'turquoise',
      'cyan',
      'sky',
      'blue',
      'iris',
      'violet',
      'purple',
      'plum',
      'pink',
      'bronze',
      'gold',
      'brown',
      'gray',
    ];

    for (const color of validColors) {
      const result = parseGraphColor(color);

      expect(result).toBeDefined();
      expect(result).toBe(color.toUpperCase());
    }
  });
});
