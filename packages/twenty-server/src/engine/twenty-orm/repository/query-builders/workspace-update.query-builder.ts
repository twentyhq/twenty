import { UpdateQueryBuilder } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class WorkspaceUpdateQueryBuilder<
  T extends ObjectRecord,
> extends UpdateQueryBuilder<T> {
  constructor(
    queryBuilder: UpdateQueryBuilder<T>,
    private readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    private readonly objectMetadataMaps: ObjectMetadataMaps,
    private readonly userId?: string, // TODO: use userWorkspaceId
  ) {
    super(queryBuilder);
  }

  override async execute() {
    this.expressionMap.returning = 'id';
    const result = await super.execute();

    return result;
  }
}
