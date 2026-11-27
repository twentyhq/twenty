import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const insertPublicDomain = ({
  domain,
  isValidated,
  applicationId,
  createdAt = new Date(),
}: {
  domain: string;
  isValidated: boolean;
  applicationId: string;
  createdAt?: Date;
}) =>
  globalThis.testDataSource.query(
    `INSERT INTO core."publicDomain"
       (domain, "isValidated", "applicationId", "workspaceId", "createdAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [domain, isValidated, applicationId, SEED_APPLE_WORKSPACE_ID, createdAt],
  );

export const deletePublicDomains = (domains: string[]) =>
  globalThis.testDataSource.query(
    `DELETE FROM core."publicDomain" WHERE domain = ANY($1)`,
    [domains],
  );
