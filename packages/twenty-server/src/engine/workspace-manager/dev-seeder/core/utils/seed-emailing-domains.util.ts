import { type QueryRunner } from 'typeorm';

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';

const tableName = 'emailingDomain';

const DEV_EMAILING_DOMAIN = 'dev.twenty.local';

type SeedEmailingDomainsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedEmailingDomains = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedEmailingDomainsArgs) => {
  const domain = `${workspaceId.slice(0, 8)}.${DEV_EMAILING_DOMAIN}`;

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'domain',
      'status',
      'verificationRecords',
      'verifiedAt',
      'tenantStatus',
    ])
    .orIgnore()
    .values([
      {
        workspaceId,
        domain,
        status: EmailingDomainStatus.VERIFIED,
        verificationRecords: JSON.stringify([]),
        verifiedAt: new Date(),
        tenantStatus: EmailingDomainTenantStatus.ACTIVE,
      },
    ])
    .execute();
};
