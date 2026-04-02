import fs from 'fs/promises';
import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export type FrontComponentSeedProjectFile = {
  name: string;
  path: string;
  content: Buffer;
};

const getAllFiles = async (
  rootDir: string,
  dir: string = rootDir,
  files: FrontComponentSeedProjectFile[] = [],
): Promise<FrontComponentSeedProjectFile[]> => {
  const dirEntries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await getAllFiles(rootDir, fullPath, files);
    } else {
      files.push({
        path: path.relative(rootDir, dir),
        name: entry.name,
        content: await fs.readFile(fullPath),
      });
    }
  }

  return files;
};

export const getFrontComponentSeedProjectFiles = async (
  subdirectory: string,
): Promise<FrontComponentSeedProjectFile[]> => {
  const seedProjectPath = path.join(
    ASSET_PATH,
    'engine/metadata-modules/front-component/constants/seed-project',
    subdirectory,
  );

  return getAllFiles(seedProjectPath);
};
