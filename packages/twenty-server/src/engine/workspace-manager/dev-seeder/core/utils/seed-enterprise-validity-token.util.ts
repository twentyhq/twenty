import { type QueryRunner } from 'typeorm';

import { ENTERPRISE_DEV_VALIDITY_TOKEN } from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';

const tableName = 'appToken';

type SeedEnterpriseValidityTokenArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
};

export const seedEnterpriseValidityToken = async ({
  queryRunner,
  schemaName,
}: SeedEnterpriseValidityTokenArgs) => {
  const existing = await queryRunner.manager
    .createQueryBuilder()
    .select('1')
    .from(`${schemaName}.${tableName}`, 'token')
    .where('token.type = :type', { type: 'ENTERPRISE_VALIDITY_TOKEN' })
    .andWhere('token."revokedAt" IS NULL')
    .getRawOne();

  if (existing) {
    return;
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'type',
      'value',
      'userId',
      'workspaceId',
      'expiresAt',
    ])
    .values([
      {
        type: 'ENTERPRISE_VALIDITY_TOKEN',
        value: ENTERPRISE_DEV_VALIDITY_TOKEN,
        userId: null,
        workspaceId: null,
        expiresAt: '2125-03-13T03:47:13.000Z',
      },
    ])
    .execute();
};
