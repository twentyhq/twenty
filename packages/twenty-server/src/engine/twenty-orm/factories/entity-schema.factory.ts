import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntitySchema, Repository } from 'typeorm';

import { EntitySchemaColumnFactory } from 'src/engine/twenty-orm/factories/entity-schema-column.factory';
import { EntitySchemaRelationFactory } from 'src/engine/twenty-orm/factories/entity-schema-relation.factory';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectEntitiesStorage } from 'src/engine/twenty-orm/storage/object-entities.storage';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class EntitySchemaFactory {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly entitySchemaColumnFactory: EntitySchemaColumnFactory,
    private readonly entitySchemaRelationFactory: EntitySchemaRelationFactory,
  ) {}

  async create(objectMetadata: ObjectMetadataEntity): Promise<EntitySchema>;

  async create(objectMetadataName: string): Promise<EntitySchema>;

  async create(
    objectMetadataOrObjectMetadataName: ObjectMetadataEntity | string,
  ): Promise<EntitySchema> {
    let objectMetadata: ObjectMetadataEntity | null =
      typeof objectMetadataOrObjectMetadataName !== 'string'
        ? objectMetadataOrObjectMetadataName
        : null;

    if (typeof objectMetadataOrObjectMetadataName === 'string') {
      objectMetadata = await this.getObjectMetadataByName(
        objectMetadataOrObjectMetadataName,
      );
    }

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    const columns = this.entitySchemaColumnFactory.create(
      objectMetadata.fields,
    );

    const relations = this.entitySchemaRelationFactory.create(
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

    ObjectEntitiesStorage.setObjectMetadataEntity(entitySchema, objectMetadata);

    return entitySchema;
  }

  private async getObjectMetadataByName(
    objectMetadataName: string,
  ): Promise<ObjectMetadataEntity | null> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: objectMetadataName,
      },
      relations: [
        'fields',
        'fields.object',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'fields.fromRelationMetadata.toObjectMetadata',
        'fields.toRelationMetadata.toObjectMetadata',
      ],
    });

    return objectMetadata;
  }
}
