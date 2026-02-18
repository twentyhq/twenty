import { readFileSync } from 'fs';
import { resolve } from 'path';

const packages = ['twenty-sdk', 'create-twenty-app'];

const verifyUniquePackageVersion = () => {
  const packageVersions = packages.map((pkg) => {
    const packageJsonPath = resolve('packages', pkg, 'package.json');

    const packageJsonFile = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    return packageJsonFile.version as string;
  });

  if (new Set(packageVersions).size !== 1) {
    console.error(
      `Build check failed: "${packages.join('", "')}" should have the same package.json version. Got ${packageVersions.join(', ')}`,
    );
    process.exit(1);
    return;
  }
  console.log(
    `"${packages.join('", "')}" share the same version ${packageVersions[0]}: OK`,
  );
};

verifyUniquePackageVersion();
