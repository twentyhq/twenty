import { readFrontComponentSharedDependenciesChecksum } from '../readFrontComponentSharedDependenciesChecksum';

const CHECKSUM = 'a'.repeat(64);
const BANNER = '// twenty-ai-shared-dependencies: ' + CHECKSUM;

describe('readFrontComponentSharedDependenciesChecksum', () => {
  it('reads the pinned checksum only from the generated first line', () => {
    expect(
      readFrontComponentSharedDependenciesChecksum(
        BANNER + '\nexport default () => {};',
      ),
    ).toBe(CHECKSUM);
  });

  it('reads a banner without a trailing newline', () => {
    expect(readFrontComponentSharedDependenciesChecksum(BANNER)).toBe(CHECKSUM);
  });

  it.each([
    '',
    'export default () => {};',
    '\n' + BANNER,
    BANNER + 'extra\n',
    '// twenty-ai-shared-dependencies: ../../other-file\n',
  ])('ignores missing or malformed metadata: %s', (source) => {
    expect(
      readFrontComponentSharedDependenciesChecksum(source),
    ).toBeUndefined();
  });
});
