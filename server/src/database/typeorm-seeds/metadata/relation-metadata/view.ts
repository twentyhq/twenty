import { DataSource } from 'typeorm';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedViewFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/view';
import { SeedViewFieldFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/view-field';
import { SeedViewFilterFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/view-filter';
import { SeedViewSortFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/view-sort';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

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
        fromObjectMetadataId: SeedObjectMetadataIds.View,
        toObjectMetadataId: SeedObjectMetadataIds.ViewField,
        fromFieldMetadataId: SeedViewFieldMetadataIds.ViewFields,
        toFieldMetadataId: SeedViewFieldFieldMetadataIds.View,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.View,
        toObjectMetadataId: SeedObjectMetadataIds.ViewFilter,
        fromFieldMetadataId: SeedViewFieldMetadataIds.ViewFilters,
        toFieldMetadataId: SeedViewFilterFieldMetadataIds.View,
        workspaceId: SeedWorkspaceId,
      },
      {
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: SeedObjectMetadataIds.View,
        toObjectMetadataId: SeedObjectMetadataIds.ViewSort,
        fromFieldMetadataId: SeedViewFieldMetadataIds.ViewSorts,
        toFieldMetadataId: SeedViewSortFieldMetadataIds.View,
        workspaceId: SeedWorkspaceId,
      },
    ])
    .execute();
};
