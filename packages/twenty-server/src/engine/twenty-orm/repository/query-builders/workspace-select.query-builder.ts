import { SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/entity.manager';
import { WorkspaceUpdateQueryBuilder } from 'src/engine/twenty-orm/repository/query-builders/workspace-update.query-builder';

import { WorkspaceDeleteQueryBuilder } from './workspace-delete.query-builder';
import { WorkspaceInsertQueryBuilder } from './workspace-insert.query-builder';
import { WorkspaceSoftDeleteQueryBuilder } from './workspace-soft-delete.query-builder';

export class WorkspaceSelectQueryBuilder<
  T extends ObjectRecord,
> extends SelectQueryBuilder<T> {
  private userId?: string;
  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    protected readonly objectMetadataItem: ObjectMetadataItemWithFieldMaps,
    protected readonly objectMetadataMaps: ObjectMetadataMaps,
    protected readonly manager: WorkspaceEntityManager,
  ) {
    super(queryBuilder);
  }

  setUserId(userId: string): this {
    this.userId = userId;

    return this;
  }

  override clone(): this {
    const clonedQueryBuilder = super.clone();

    return new WorkspaceSelectQueryBuilder(
      clonedQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
      this.manager,
    ) as this;
  }

  override async getMany(): Promise<T[]> {
    const result = await super.getMany();

    return result;
  }

  override async getOne(): Promise<T | null> {
    const result = await super.getOne();

    return result;
  }

  override update(): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T>;

  override update(
    updateSet?: QueryDeepPartialEntity<T>,
  ): WorkspaceUpdateQueryBuilder<T> {
    const updateQueryBuilder = updateSet
      ? super.update(updateSet)
      : super.update();

    return new WorkspaceUpdateQueryBuilder(
      updateQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
      this.userId,
    );
  }

  override insert(): WorkspaceInsertQueryBuilder<T>;

  override insert(): WorkspaceInsertQueryBuilder<T> {
    const insertQueryBuilder = super.insert();

    return new WorkspaceInsertQueryBuilder(
      insertQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override delete(): WorkspaceDeleteQueryBuilder<T> {
    const deleteQueryBuilder = super.delete();

    return new WorkspaceDeleteQueryBuilder(
      deleteQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override softDelete(): WorkspaceSoftDeleteQueryBuilder<T> {
    const softDeleteQueryBuilder = super.softDelete();

    return new WorkspaceSoftDeleteQueryBuilder(
      softDeleteQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }

  override restore(): WorkspaceSoftDeleteQueryBuilder<T> {
    const restoreQueryBuilder = super.restore();

    return new WorkspaceSoftDeleteQueryBuilder(
      restoreQueryBuilder,
      this.objectMetadataItem,
      this.objectMetadataMaps,
    );
  }
}
