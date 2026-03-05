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
  it('should return a resolved CSS variable value for a color', () => {
    const mockTheme = {
      color: new Proxy({} as Record<string, string>, {
        get: (_, prop) => `mock-${String(prop)}`,
      }),
    } as any;

    const color = stringToThemeColorP3String({
      string: 'test',
      variant: 9,
      theme: mockTheme,
    });

    expect(typeof color).toBe('string');
  });
});
