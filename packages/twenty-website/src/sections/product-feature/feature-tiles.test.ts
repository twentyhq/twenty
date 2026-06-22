import { FEATURE_TILES, type FeatureVisualKey } from './feature-tiles';

// The visual registry in tile-visual.tsx is a total Record over
// FeatureVisualKey, so the compiler guarantees every key renders; this
// pins the converse — every key is used by exactly one tile.
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
