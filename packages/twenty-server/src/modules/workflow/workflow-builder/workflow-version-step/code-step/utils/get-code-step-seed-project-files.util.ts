import fs from 'fs/promises';
import path from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export type CodeStepSeedProjectFile = {
  name: string;
  path: string;
  content: Buffer;
};

const getAllFiles = async (
  rootDir: string,
  dir: string = rootDir,
  files: CodeStepSeedProjectFile[] = [],
): Promise<CodeStepSeedProjectFile[]> => {
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

export const getCodeStepSeedProjectFiles = async (): Promise<
  CodeStepSeedProjectFile[]
> => {
  const seedProjectPath = path.join(
    ASSET_PATH,
    'modules/workflow/workflow-builder/workflow-version-step/code-step/constants/seed-project',
  );

  return getAllFiles(seedProjectPath);
};
