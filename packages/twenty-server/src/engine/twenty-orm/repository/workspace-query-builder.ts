import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

import { WorkspaceSelectQueryBuilder } from './query-builders/workspace-select.query-builder';

export class WorkspaceQueryBuilder<
  Entity extends ObjectLiteral,
> extends WorkspaceSelectQueryBuilder<Entity> {
  constructor(
    queryBuilder: SelectQueryBuilder<Entity>,
    objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder, objectMetadataItem, objectMetadataMaps);
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    console.log('clonedQueryBuilder');

    return new WorkspaceQueryBuilder(
      clonedQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    ) as this;
  }
}
