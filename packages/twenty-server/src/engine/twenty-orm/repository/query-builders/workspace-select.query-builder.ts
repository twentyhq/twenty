import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/query-builders/workspace-update.query-builder';

import { WorkspaceDeleteQueryBuilder } from './workspace-delete.query-builder';
import { WorkspaceInsertQueryBuilder } from './workspace-insert.query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from './workspace-soft-delete.query-builder';

export class WorkspaceSelectQueryBuilder<
  Entity extends ObjectLiteral,
> extends SelectQueryBuilder<Entity> {
  constructor(
    queryBuilder: SelectQueryBuilder<Entity>,
    protected readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    protected readonly objectMetadataMaps: ObjectMetadataMaps,
  ) {
    super(queryBuilder);
  }

  override async getMany(): Promise<Entity[]> {
    const result = await super.getMany();

    console.log('select many result');

    return result;
  }

  override async getOne(): Promise<Entity | null> {
    const result = await super.getOne();

    console.log('select one result');

    return result;
  }

  override update(): WorkspaceUpdateQueryBuilder<Entity>;

  override update(
    updateSet: QueryDeepPartialEntity<Entity>,
  ): WorkspaceUpdateQueryBuilder<Entity>;

  override update(
    updateSet?: QueryDeepPartialEntity<Entity>,
  ): WorkspaceUpdateQueryBuilder<Entity> {
    const updateQueryBuilder = updateSet
      ? super.update(updateSet)
      : super.update();

    return new WorkspaceUpdateQueryBuilder(
      updateQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override insert(): WorkspaceInsertQueryBuilder<Entity>;

  override insert(): WorkspaceInsertQueryBuilder<Entity> {
    const insertQueryBuilder = super.insert();

    return new WorkspaceInsertQueryBuilder(
      insertQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<Entity> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder(
      deleteQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const softDeleteQueryBuilder = super.softDelete();

    return new WorkspaceSoftDeleteQueryBuilder(
      softDeleteQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<Entity> {
    const restoreQueryBuilder = super.restore();

    return new WorkspaceSoftDeleteQueryBuilder(
      restoreQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }
}
