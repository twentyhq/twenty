import { type QueryRunner } from 'typeorm';

import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';

const tableName = 'emailingDomain';

// Synthetic dev domain. Pre-verified so the campaign drawer accepts it without
// any DNS / SES configuration. To exercise the send flow without AWS, set
// EMAILING_DOMAIN_DRIVER=LOG in your .env — the worker will then log each
// "send" instead of calling SES and mark each message SENT.
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
  // Each workspace gets a different sub-domain because the unique constraint
  // on `domain` is workspace-agnostic (global).
  const domain = `${workspaceId.slice(0, 8)}.${DEV_EMAILING_DOMAIN}`;

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'domain',
      'driver',
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
        driver: EmailingDomainDriver.LOG,
        status: EmailingDomainStatus.VERIFIED,
        verificationRecords: JSON.stringify([]),
        verifiedAt: new Date(),
        tenantStatus: EmailingDomainTenantStatus.ACTIVE,
      },
    ])
    .execute();
};
