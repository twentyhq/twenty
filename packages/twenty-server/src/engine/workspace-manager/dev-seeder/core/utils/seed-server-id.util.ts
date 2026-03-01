import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

type SeedServerIdArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
};

export const seedServerId = async ({
  queryRunner,
  schemaName,
}: SeedServerIdArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.keyValuePair`, ['key', 'value', 'type'])
    .orIgnore()
    .values([
      {
        key: 'SERVER_ID',
        type: 'CONFIG_VARIABLE',
        value: v4(),
      },
    ])
    .execute();
};
