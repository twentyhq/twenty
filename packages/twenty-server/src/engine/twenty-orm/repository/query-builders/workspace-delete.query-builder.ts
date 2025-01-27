import { DeleteQueryBuilder, ObjectLiteral } from 'typeorm';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceDeleteQueryBuilder<
  Entity extends ObjectLiteral,
> extends DeleteQueryBuilder<Entity> {
  constructor(
    queryBuilder: DeleteQueryBuilder<Entity>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async execute() {
    const result = await super.execute();

    console.log('delete result');

    return result;
  }
}
