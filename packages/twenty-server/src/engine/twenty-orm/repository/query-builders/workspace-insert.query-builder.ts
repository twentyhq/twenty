import { InsertQueryBuilder, ObjectLiteral } from 'typeorm';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceInsertQueryBuilder<
  Entity extends ObjectLiteral,
> extends InsertQueryBuilder<Entity> {
  constructor(
    queryBuilder: InsertQueryBuilder<Entity>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async execute() {
    const result = await super.execute();

    console.log('insert result');

    return result;
  }
}
