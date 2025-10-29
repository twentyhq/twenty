import { THEME_LIGHT } from '@ui/theme';
import { stringToThemeColor } from '@ui/utilities';
import { stringToThemeColorP3String } from '@ui/utilities/color/utils/stringToThemeColorP3String';

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

describe('stringToThemeColorP3String', () => {
  it('should return a theme color based on a string', () => {
    const color = stringToThemeColorP3String({
      string: 'test',
      theme: THEME_LIGHT,
      variant: 9,
    });

    expect(typeof color).toBe('string');
    expect(Object.values(THEME_LIGHT.color)).toContain(color);
  });
});
