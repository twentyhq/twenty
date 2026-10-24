import { formatBytes } from '../format/formatBytes';

describe('formatBytes', () => {
  it.each([
    [0, '0 B'],
    [1, '1 B'],
    [1023, '1023 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1024 ** 2, '1 MB'],
    [1024 ** 3, '1 GB'],
    [107_374_182_400, '100 GB'],
    [1024 ** 4, '1 TB'],
  ])('formats %i as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });

  it('stays on terabytes past the largest unit', () => {
    expect(formatBytes(1024 ** 5)).toBe('1024 TB');
  });

  it.each([
    [1024 ** 2 - 1, '1 MB'],
    [1024 ** 3 - 1, '1 GB'],
    [1024 ** 4 - 1, '1 TB'],
  ])(
    'moves to the next unit when rounding reaches 1024: %i as %s',
    (bytes, expected) => {
      expect(formatBytes(bytes)).toBe(expected);
    },
  );

  it('keeps a negative size on bytes rather than producing NaN', () => {
    expect(formatBytes(-1)).toBe('-1 B');
  });
});
