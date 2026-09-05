import { type QueryRunner } from 'typeorm';

import { UNSUBSCRIBE_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-hostname-prefix.constant';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';

const tableName = 'emailingDomain';

const DEV_EMAILING_DOMAIN = 'dev.twenty.local';

export const getSeededEmailGroupDomains = (workspaceId: string) => {
  const prefix = workspaceId.slice(0, 8);

  return {
    verified: `${prefix}.${DEV_EMAILING_DOMAIN}`,
    pending: `${prefix}.pending.${DEV_EMAILING_DOMAIN}`,
  };
};

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
  const { verified, pending } = getSeededEmailGroupDomains(workspaceId);

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
      'unsubscribeHostname',
      'unsubscribeHostnameStatus',
    ])
    .orIgnore()
    .values([
      {
        workspaceId,
        domain: verified,
        status: EmailingDomainStatus.VERIFIED,
        verificationRecords: [],
        verifiedAt: new Date(),
        tenantStatus: EmailingDomainTenantStatus.ACTIVE,
        unsubscribeHostname: `${UNSUBSCRIBE_HOSTNAME_PREFIX}.${verified}`,
        unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
      },
      {
        workspaceId,
        domain: pending,
        status: EmailingDomainStatus.PENDING,
        verificationRecords: [
          {
            type: 'TXT',
            key: `_amazonses.${pending}`,
            value: 'seed-verification-token',
          },
          {
            type: 'CNAME',
            key: `seed1._domainkey.${pending}`,
            value: 'seed1.dkim.amazonses.com',
          },
        ],
        verifiedAt: null,
        tenantStatus: EmailingDomainTenantStatus.ACTIVE,
        unsubscribeHostname: null,
        unsubscribeHostnameStatus: null,
      },
    ])
    .execute();
};
