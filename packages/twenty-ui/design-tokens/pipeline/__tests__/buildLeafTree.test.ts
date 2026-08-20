import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildLeafTree } from '../buildLeafTree';

const leafAt = (path: string[]): CollectedTokenLeaf => ({
  path,
  varName: `--t-${path.join('-')}`,
  light: 'light-value',
  dark: 'dark-value',
});

describe('buildLeafTree', () => {
  it('nests leaves under their shared path segments', () => {
    expect(
      buildLeafTree({
        leaves: [
          leafAt(['border', 'radius', 'md']),
          leafAt(['border', 'width']),
        ],
        leafValue: (leaf) => leaf.light,
      }),
    ).toEqual({
      border: { radius: { md: 'light-value' }, width: 'light-value' },
    });
  });

  it('throws when a path segment is already a leaf', () => {
    expect(() =>
      buildLeafTree({
        leaves: [
          leafAt(['border', 'radius']),
          leafAt(['border', 'radius', 'md']),
        ],
        leafValue: (leaf) => leaf.light,
      }),
    ).toThrow('Token path collision at "border.radius.md"');
  });
});
