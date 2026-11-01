import { computePackageJsonChecksum } from 'twenty-shared/application';

export const TEST_APPLICATION_PACKAGE_JSON = JSON.stringify({
  name: 'test-application',
  version: '1.0.0',
});

export const TEST_APPLICATION_PACKAGE_JSON_CHECKSUM =
  computePackageJsonChecksum(TEST_APPLICATION_PACKAGE_JSON);
