import { pathToVarName } from '../pathToVarName';

describe('pathToVarName', () => {
  it('joins segments with dashes under the --t- prefix', () => {
    expect(pathToVarName(['border', 'color', 'strong'])).toBe(
      '--t-border-color-strong',
    );
  });

  it('splits camelCase segments into dashed words', () => {
    expect(pathToVarName(['border', 'radius', 'smRound'])).toBe(
      '--t-border-radius-sm-round',
    );
  });

  it('lowercases a leading capital without adding a dash', () => {
    expect(pathToVarName(['IllustrationIcon', 'color', 'blue'])).toBe(
      '--t-illustration-icon-color-blue',
    );
  });

  it('replaces dots inside a segment with an underscore', () => {
    expect(pathToVarName(['spacing', '0.5'])).toBe('--t-spacing-0_5');
  });
});
