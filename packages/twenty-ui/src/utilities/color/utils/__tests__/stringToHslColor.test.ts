import { stringToHslColor } from '../stringToHslColor';

describe('stringToHslColor', () => {
  it('should return a color based on a string', () => {
    expect(stringToHslColor('red', 70, 90)).toBe('hsl(105, 70%, 90%)');
  });
});
