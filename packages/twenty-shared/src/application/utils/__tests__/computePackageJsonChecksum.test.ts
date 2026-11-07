import { createHash } from 'crypto';

import { computeDependencyFileChecksum } from '@/application/utils/computeDependencyFileChecksum';
import { computePackageJsonChecksum } from '@/application/utils/computePackageJsonChecksum';

const PACKAGE_JSON_CONTENT =
  '{\n  "dependencies": {\n    "axios": "^1.16.1"\n  }\n}\n';

const computeServerChecksum = (content: string) =>
  createHash('sha512').update(content).digest('hex').substring(0, 32);

describe('computeDependencyFileChecksum', () => {
  it('matches the checksum the server stored for its default packages', () => {
    const yarnLockContent = '__metadata:\n  version: 8\n';

    expect(computeDependencyFileChecksum(yarnLockContent)).toBe(
      computeServerChecksum(yarnLockContent),
    );
  });
});

describe('computePackageJsonChecksum', () => {
  it('matches the checksum the server stored for its default packages', () => {
    expect(computePackageJsonChecksum(PACKAGE_JSON_CONTENT)).toBe(
      computeServerChecksum(JSON.stringify(JSON.parse(PACKAGE_JSON_CONTENT))),
    );
  });

  it('ignores formatting', () => {
    expect(
      computePackageJsonChecksum('{"dependencies":{"axios":"^1.16.1"}}'),
    ).toBe(computePackageJsonChecksum(PACKAGE_JSON_CONTENT));
  });

  it('changes when a dependency changes', () => {
    expect(
      computePackageJsonChecksum('{"dependencies":{"axios":"^1.16.2"}}'),
    ).not.toBe(computePackageJsonChecksum(PACKAGE_JSON_CONTENT));
  });
});
