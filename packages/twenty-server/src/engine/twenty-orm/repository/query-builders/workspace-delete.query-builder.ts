import { DeleteQueryBuilder } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceDeleteQueryBuilder<
  T extends ObjectRecord,
> extends DeleteQueryBuilder<T> {
  constructor(
    queryBuilder: DeleteQueryBuilder<T>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async execute() {
    const result = await super.execute();

    return result;
  }
}
