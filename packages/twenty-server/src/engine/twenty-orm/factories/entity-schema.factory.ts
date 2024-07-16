import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntitiesStorage } from 'src/engine/twenty-orm/storage/workspace-entities.storage';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async create(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
  ): Promise<EntitySchema>;

  async create(
    workspaceId: string,
    objectMetadataName: string,
  ): Promise<EntitySchema>;

  async create(
    workspaceId: string,
    objectMetadataOrObjectMetadataName: ObjectMetadataEntity | string,
  ): Promise<EntitySchema> {
    let objectMetadata: ObjectMetadataEntity | null =
      typeof objectMetadataOrObjectMetadataName !== 'string'
        ? objectMetadataOrObjectMetadataName
        : null;

    if (typeof objectMetadataOrObjectMetadataName === 'string') {
      objectMetadata =
        (await this.workspaceCacheStorageService.getObjectMetadata(
          workspaceId,
          (objectMetadata) =>
            objectMetadata.nameSingular === objectMetadataOrObjectMetadataName,
        )) ?? null;
    }

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    const columns = this.entitySchemaColumnFactory.create(
      workspaceId,
      objectMetadata.fields,
    );

    const relations = await this.entitySchemaRelationFactory.create(
      workspaceId,
      objectMetadata.fields,
    );

    const entitySchema = new EntitySchema({
      name: objectMetadata.nameSingular,
      tableName: computeTableName(
        objectMetadata.nameSingular,
        objectMetadata.isCustom,
      ),
      columns,
      relations,
    });

    WorkspaceEntitiesStorage.setEntitySchema(
      workspaceId,
      objectMetadata.nameSingular,
      entitySchema,
    );

    return entitySchema;
  }
}
