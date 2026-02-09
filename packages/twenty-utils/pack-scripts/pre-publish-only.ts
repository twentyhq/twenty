import * as fs from 'fs-extra';
import { BACKUP_PATH, PKG_PATH } from './constants';
import { type PackageJson } from 'type-fest';

const stripWorkspace = (deps: PackageJson['dependencies']) =>
  Object.fromEntries(
    Object.entries(deps).filter(
      ([_, value]) => !value.startsWith('workspace:'),
    ),
  );

const main = async () => {
  const pkg = await fs.readJson(PKG_PATH);

  await fs.writeJson(BACKUP_PATH, pkg, { spaces: 2 });

  const { devDependencies: _, ...builtPkg } = pkg;

  builtPkg.dependencies = stripWorkspace(builtPkg.dependencies ?? {});

  await fs.writeJson(PKG_PATH, builtPkg, { spaces: 2 });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
