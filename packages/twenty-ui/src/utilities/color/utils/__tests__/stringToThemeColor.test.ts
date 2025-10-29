import { stringToThemeColor } from '../stringToThemeColor';

describe('stringToThemeColor', () => {
  it('should return a theme color based on a string', () => {
    const color = stringToThemeColor('test');
    expect(typeof color).toBe('string');
    expect(color).toMatch(
      /^(gray|tomato|red|ruby|crimson|pink|plum|purple|violet|iris|cyan|turquoise|sky|blue|jade|green|grass|mint|lime|bronze|gold|brown|orange|amber|yellow)$/,
    );
  });

  it('should return the same color for the same string', () => {
    const color1 = stringToThemeColor('test');
    const color2 = stringToThemeColor('test');
    expect(color1).toBe(color2);
  });
});
