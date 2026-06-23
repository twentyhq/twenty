import { movePipelineCard, type PipelineLanes } from './pipeline-move-card';

const LANES: PipelineLanes = [['github', 'figma'], ['airbnb'], []];

describe('movePipelineCard', () => {
  it('should reorder within a lane when the target is the same lane', () => {
    expect(movePipelineCard(LANES, 'github', 0, 1)).toEqual([
      ['figma', 'github'],
      ['airbnb'],
      [],
    ]);
  });

  it('should move a card across lanes at the requested index', () => {
    expect(movePipelineCard(LANES, 'figma', 1, 1)).toEqual([
      ['github'],
      ['airbnb', 'figma'],
      [],
    ]);
  });

  it('should clamp an out-of-range index to the lane end', () => {
    expect(movePipelineCard(LANES, 'github', 1, 99)).toEqual([
      ['figma'],
      ['airbnb', 'github'],
      [],
    ]);
  });

  it('should clamp a negative index to the lane start', () => {
    expect(movePipelineCard(LANES, 'airbnb', 0, -1)).toEqual([
      ['airbnb', 'github', 'figma'],
      [],
      [],
    ]);
  });

  it('should keep a dropped-in-place card where it was', () => {
    expect(movePipelineCard(LANES, 'github', 0, 0)).toEqual(LANES);
  });

  it('should not mutate the input lanes', () => {
    movePipelineCard(LANES, 'github', 1, 0);
    expect(LANES).toEqual([['github', 'figma'], ['airbnb'], []]);
  });
});
