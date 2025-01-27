import { SelectQueryBuilder } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';

import { WorkspaceSelectQueryBuilder } from './query-builders/workspace-select.query-builder';

export class WorkspaceQueryBuilder<
  T extends ObjectRecord,
> extends WorkspaceSelectQueryBuilder<T> {
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
    manager: WorkspaceEntityManager,
  ) {
    super(queryBuilder, objectMetadataItem, objectMetadataMaps, manager);
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceQueryBuilder(
      clonedQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
      this.manager,
    ) as this;
  }
}
