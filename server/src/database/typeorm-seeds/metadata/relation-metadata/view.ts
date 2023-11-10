import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const tableName = 'relationMetadata';

export const seedViewRelationMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'relationType',
      'fromObjectMetadataId',
      'toObjectMetadataId',
      'fromFieldMetadataId',
      'toFieldMetadataId',
      'workspaceId',
    ])
    .orIgnore()
    .values([
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: '9ab6b3dc-767f-473f-8fd0-6cdbefbf8dbe', // View
        toObjectMetadataId: '61d9000b-485c-4c48-a22e-0d9a164f9647', // ViewField
        fromFieldMetadataId: '064eb439-fdfa-4246-a13a-989c5bcc4d97', // View > ViewFields
        toFieldMetadataId: 'a9a56210-a154-4965-9ace-c35f6dc43ee5', // ViewField > View
        workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      },
    ])
    .execute();
};
