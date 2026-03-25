import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const verifyBuildPackagesBundleTwentyDependencies = () => {
  const distPath = resolve('dist/cli.cjs');

  if (!existsSync(distPath)) {
    console.error(`Build check failed: ${distPath} does not exist`);
    process.exit(1);
  }

  const content = readFileSync(distPath, 'utf8');

  const filePath = resolve('package.json');

  const pkg = JSON.parse(readFileSync(filePath, 'utf8'));

  if (/require\("twenty/.test(content)) {
    console.error(
      `Build check failed: ${pkg.name}/dist/cli.cjs contains a require("twenty...) import. Workspace packages should be bundled, not externalized.`,
    );
    process.exit(1);
  } else {
    console.log(`${pkg.name}/dist/cli.cjs: OK`);
  }
};

verifyBuildPackagesBundleTwentyDependencies();
