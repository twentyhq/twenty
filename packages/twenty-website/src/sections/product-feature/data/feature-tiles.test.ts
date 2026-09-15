import { type FeatureVisualKey } from '../types/feature-visual-key';
import { FEATURE_TILES } from './feature-tiles';

const ALL_VISUAL_KEYS: FeatureVisualKey[] = [
  'contacts',
  'dashboard',
  'emails',
  'files',
  'import',
  'pipeline',
  'tasks',
];

describe('FEATURE_TILES', () => {
  it('should use every visual key exactly once', () => {
    const usedKeys = FEATURE_TILES.map((tile) => tile.visual);
    expect(usedKeys.toSorted()).toEqual(ALL_VISUAL_KEYS.toSorted());
    expect(new Set(usedKeys).size).toBe(FEATURE_TILES.length);
  });

  it('should spotlight the dashboard tile first', () => {
    expect(FEATURE_TILES[0].visual).toBe('dashboard');
  });
});
