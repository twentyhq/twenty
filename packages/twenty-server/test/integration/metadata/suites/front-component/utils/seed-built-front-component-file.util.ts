import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STORAGE_LOCAL_PATH = join(process.cwd(), '.local-storage');

const getWorkspaceCustomApplicationUniversalIdentifier = async (
  workspaceId: string,
): Promise<string> => {
  const result = await global.testDataSource.query(
    'SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1',
    [workspaceId],
  );

  return result[0].workspaceCustomApplicationId;
};

export const seedBuiltFrontComponentFile = async ({
  workspaceId = SEED_APPLE_WORKSPACE_ID,
  builtComponentPath,
}: {
  workspaceId?: string;
  builtComponentPath: string;
}): Promise<{ cleanup: () => void }> => {
  const applicationUniversalIdentifier =
    await getWorkspaceCustomApplicationUniversalIdentifier(workspaceId);

  const filePath = join(
    STORAGE_LOCAL_PATH,
    workspaceId,
    applicationUniversalIdentifier,
    'built-front-component',
    builtComponentPath,
  );

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, 'dummy built component content');

  return {
    cleanup: () => {
      if (existsSync(filePath)) {
        rmSync(filePath);
      }
    },
  };
};
