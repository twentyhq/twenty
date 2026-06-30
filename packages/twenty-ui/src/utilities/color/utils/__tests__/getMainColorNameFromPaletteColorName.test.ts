import { getMainColorNameFromPaletteColorName } from '../getMainColorNameFromPaletteColorName';

describe('getMainColorNameFromPaletteColorName', () => {
  it('should extract main color name from palette color names', () => {
    expect(getMainColorNameFromPaletteColorName('purple5')).toBe('purple');
    expect(getMainColorNameFromPaletteColorName('blue8')).toBe('blue');
    expect(getMainColorNameFromPaletteColorName('red3')).toBe('red');
    expect(getMainColorNameFromPaletteColorName('orange12')).toBe('orange');
    expect(getMainColorNameFromPaletteColorName('yellow1')).toBe('yellow');
    expect(getMainColorNameFromPaletteColorName('crimson9')).toBe('crimson');
    expect(getMainColorNameFromPaletteColorName('violet7')).toBe('violet');
    expect(getMainColorNameFromPaletteColorName('iris4')).toBe('iris');
    expect(getMainColorNameFromPaletteColorName('grass6')).toBe('grass');
    expect(getMainColorNameFromPaletteColorName('mint5')).toBe('mint');
    expect(getMainColorNameFromPaletteColorName('lime3')).toBe('lime');
    expect(getMainColorNameFromPaletteColorName('bronze8')).toBe('bronze');
    expect(getMainColorNameFromPaletteColorName('gold2')).toBe('gold');
    expect(getMainColorNameFromPaletteColorName('pink1')).toBe('pink');
    expect(getMainColorNameFromPaletteColorName('turquoise2')).toBe(
      'turquoise',
    );
    expect(getMainColorNameFromPaletteColorName('green10')).toBe('green');
    expect(getMainColorNameFromPaletteColorName('cyan11')).toBe('cyan');
    expect(getMainColorNameFromPaletteColorName('jade12')).toBe('jade');
  });

  it('should handle color names without numbers', () => {
    expect(getMainColorNameFromPaletteColorName('purple')).toBe('purple');
    expect(getMainColorNameFromPaletteColorName('blue')).toBe('blue');
    expect(getMainColorNameFromPaletteColorName('red')).toBe('red');
    expect(getMainColorNameFromPaletteColorName('orange')).toBe('orange');
    expect(getMainColorNameFromPaletteColorName('yellow')).toBe('yellow');
    expect(getMainColorNameFromPaletteColorName('crimson')).toBe('crimson');
    expect(getMainColorNameFromPaletteColorName('violet')).toBe('violet');
    expect(getMainColorNameFromPaletteColorName('iris')).toBe('iris');
    expect(getMainColorNameFromPaletteColorName('grass')).toBe('grass');
    expect(getMainColorNameFromPaletteColorName('mint')).toBe('mint');
    expect(getMainColorNameFromPaletteColorName('lime')).toBe('lime');
    expect(getMainColorNameFromPaletteColorName('bronze')).toBe('bronze');
    expect(getMainColorNameFromPaletteColorName('gold')).toBe('gold');
    expect(getMainColorNameFromPaletteColorName('pink')).toBe('pink');
    expect(getMainColorNameFromPaletteColorName('turquoise')).toBe('turquoise');
    expect(getMainColorNameFromPaletteColorName('green')).toBe('green');
    expect(getMainColorNameFromPaletteColorName('cyan')).toBe('cyan');
    expect(getMainColorNameFromPaletteColorName('jade')).toBe('jade');
    expect(getMainColorNameFromPaletteColorName('gray')).toBe('gray');
  });
});
