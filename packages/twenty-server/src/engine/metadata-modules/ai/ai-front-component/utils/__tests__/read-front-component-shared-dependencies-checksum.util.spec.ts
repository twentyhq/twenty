import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';

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

  it.each([
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
