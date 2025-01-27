import { ObjectLiteral } from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceSoftDeleteQueryBuilder<
  Entity extends ObjectLiteral,
> extends SoftDeleteQueryBuilder<Entity> {
  constructor(
    queryBuilder: SoftDeleteQueryBuilder<Entity>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async execute() {
    const result = await super.execute();

    console.log('soft delete or restore result');

    return result;
  }
}
