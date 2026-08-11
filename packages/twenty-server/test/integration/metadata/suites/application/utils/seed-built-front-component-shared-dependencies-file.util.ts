import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');

export const seedBuiltFrontComponentSharedDependenciesFile = ({
  workspaceId = SEED_APPLE_WORKSPACE_ID,
  applicationUniversalIdentifier,
  builtPath,
  content,
}: {
  workspaceId?: string;
  applicationUniversalIdentifier: string;
  builtPath: string;
  content: string;
}): { cleanup: () => void } => {
  const filePath = join(
    STORAGE_LOCAL_PATH,
    workspaceId,
    applicationUniversalIdentifier,
    'built-front-component',
    builtPath,
  );

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);

  return {
    cleanup: () => {
      if (existsSync(filePath)) {
        rmSync(filePath);
      }
    },
  };
};
