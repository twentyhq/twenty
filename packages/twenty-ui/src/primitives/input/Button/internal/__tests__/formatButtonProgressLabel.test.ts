import { formatButtonProgressLabel } from '../formatButtonProgressLabel';

describe('formatButtonProgressLabel', () => {
  it('pads a single-digit percentage with a figure space', () => {
    expect(formatButtonProgressLabel(0)).toBe(' (0%)');
    expect(formatButtonProgressLabel(7)).toBe(' (7%)');
  });

  it('leaves a two-digit percentage unpadded', () => {
    expect(formatButtonProgressLabel(10)).toBe('(10%)');
    expect(formatButtonProgressLabel(42)).toBe('(42%)');
    expect(formatButtonProgressLabel(100)).toBe('(100%)');
  });

  it('rounds the percentage', () => {
    expect(formatButtonProgressLabel(9.6)).toBe('(10%)');
    expect(formatButtonProgressLabel(42.4)).toBe('(42%)');
  });
});
