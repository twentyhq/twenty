import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type DataSource } from 'typeorm';

import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

const tableName = 'workspace';

export const SEED_APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
export const SEED_YCOMBINATOR_WORKSPACE_ID =
  '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

export type SeedWorkspaceArgs = {
  dataSource: DataSource;
  schemaName: string;
  workspaceId: string;
  appVersion: string | undefined;
};

const workspaceSeederFields = [
  'id',
  'displayName',
  'subdomain',
  'inviteHash',
  'logo',
  'activationStatus',
  'version',
  'isTwoFactorAuthenticationEnforced',
] as const satisfies (keyof Workspace)[];

type WorkspaceSeederFields = Pick<
  Workspace,
  (typeof workspaceSeederFields)[number]
>;

export const seedWorkspaces = async ({
  schemaName,
  dataSource,
  workspaceId,
  appVersion,
}: SeedWorkspaceArgs) => {
  const version = extractVersionMajorMinorPatch(appVersion);

  const workspaces: Record<string, WorkspaceSeederFields> = {
    [SEED_APPLE_WORKSPACE_ID]: {
      id: SEED_APPLE_WORKSPACE_ID,
      displayName: 'Apple',
      subdomain: 'apple',
      inviteHash: 'apple.dev-invite-hash',
      logo: 'https://twentyhq.github.io/placeholder-images/workspaces/apple-logo.png',
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
      version: version,
      isTwoFactorAuthenticationEnforced: false,
    },
    [SEED_YCOMBINATOR_WORKSPACE_ID]: {
      id: SEED_YCOMBINATOR_WORKSPACE_ID,
      displayName: 'KVOIP',
      subdomain: 'yc',
      inviteHash: 'yc.dev-invite-hash',
      logo: 'https://pps.whatsapp.net/v/t61.24694-24/386461787_330988482947248_4965148015673603950_n.jpg?ccb=11-4&oh=01_Q5Aa2gFezZWaVVHcAEOK7AYV9pr_EbMs5rtPshZW8VEjWl9NsA&oe=68E14146&_nc_sid=5e03e0&_nc_cat=100',
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
      version: version,
      isTwoFactorAuthenticationEnforced: false,
    },
  };

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, workspaceSeederFields)
    .orIgnore()
    .values(workspaces[workspaceId])
    .execute();
};

export const deleteWorkspaces = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`${tableName}."id" = :id`, { id: workspaceId })
    .execute();
};
