import { ObjectLiteral, UpdateQueryBuilder } from 'typeorm';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceUpdateQueryBuilder<
  Entity extends ObjectLiteral,
> extends UpdateQueryBuilder<Entity> {
  constructor(
    queryBuilder: UpdateQueryBuilder<Entity>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async execute() {
    const result = await super.execute();

    console.log('update result');

    return result;
  }
}
