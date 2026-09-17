import crypto from 'crypto';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const insertCatalogApplicationRegistration = async ({
  universalIdentifier,
  name,
  sourcePackage = null,
  sourceType = ApplicationRegistrationSourceType.NPM,
  latestAvailableVersion = '1.0.0',
  manifest = null,
  category = null,
  workspaceId = SEED_APPLE_WORKSPACE_ID,
}: {
  universalIdentifier: string;
  name: string;
  sourcePackage?: string | null;
  sourceType?: ApplicationRegistrationSourceType;
  latestAvailableVersion?: string | null;
  manifest?: Record<string, unknown> | null;
  category?: string | null;
  workspaceId?: string | null;
}): Promise<string> => {
  const id = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId",
       "oAuthRedirectUris", "oAuthScopes", "workspaceId",
       "sourceType", "sourcePackage", "latestAvailableVersion",
       "manifest", "isListed", "category")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      universalIdentifier,
      name,
      oAuthClientId,
      [],
      [],
      workspaceId,
      sourceType,
      sourcePackage,
      latestAvailableVersion,
      manifest ? JSON.stringify(manifest) : null,
      true,
      category,
    ],
  );

  return id;
};
