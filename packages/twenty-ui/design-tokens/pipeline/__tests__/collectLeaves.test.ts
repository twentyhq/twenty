import { collectLeaves } from '../collectLeaves';

describe('collectLeaves', () => {
  it('walks nested nodes and derives the CSS variable name from the path', () => {
    expect(
      collectLeaves({
        border: { radius: { smRound: { light: '4px', dark: '4px' } } },
      }),
    ).toEqual([
      {
        path: ['border', 'radius', 'smRound'],
        varName: '--t-border-radius-sm-round',
        light: '4px',
        dark: '4px',
      },
    ]);
  });

  it('keeps the number unit on leaves that declare it', () => {
    expect(
      collectLeaves({
        lastLayerZIndex: {
          light: '2147483647',
          dark: '2147483647',
          unit: 'number',
        },
      })[0].unit,
    ).toBe('number');
  });

  it('throws when two token paths map to the same CSS variable', () => {
    expect(() =>
      collectLeaves({
        IllustrationIcon: { color: { light: 'a', dark: 'a' } },
        illustrationIcon: { color: { light: 'b', dark: 'b' } },
      }),
    ).toThrow(
      'Token paths "IllustrationIcon.color" and "illustrationIcon.color" both map to the CSS variable "--t-illustration-icon-color"',
    );
  });

  it('throws when a leaf marked unit number does not parse as a number', () => {
    expect(() =>
      collectLeaves({
        spacingMultiplicator: { light: '4px', dark: '4px', unit: 'number' },
      }),
    ).toThrow(
      "is marked unit: 'number' but its values do not parse as numbers",
    );
  });
});
