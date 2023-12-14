import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { Repository } from 'typeorm';

import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import { MappedObjectMetadataEntity } from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';

import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { TypedReflect } from 'src/utils/typed-reflect';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

@Injectable()
export class ReflectiveMetadataFactory {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
  ) {}

  async createObjectMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    initialDataSourceId: string,
  ): Promise<PartialObjectMetadata | undefined> {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', metadata);
    const fieldMetadata =
      TypedReflect.getMetadata('fieldMetadata', metadata) ?? {};
    let dataSourceId = initialDataSourceId;

    if (objectMetadata?.dataSourceSchema) {
      const dataSource = await this.dataSourceRepository.findOne({
        where: {
          schema: objectMetadata.dataSourceSchema,
        },
      });

      if (!dataSource) {
        throw new InternalServerErrorException(
          'Data source not found for object metadata',
        );
      }

      dataSourceId = dataSource.id;

      delete objectMetadata.dataSourceSchema;
    }

    if (objectMetadata) {
      const fields = Object.values(fieldMetadata);

      return {
        ...objectMetadata,
        workspaceId,
        dataSourceId,
        fields: fields.map((field) => ({
          ...field,
          workspaceId,
          isSystem: objectMetadata.isSystem || field.isSystem,
          defaultValue: field.defaultValue,
        })),
      };
    }

    return undefined;
  }

  async createObjectMetadataCollection(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    dataSourceId: string,
  ) {
    const metadataPromises = metadataCollection.map((metadata) =>
      this.createObjectMetadata(metadata, workspaceId, dataSourceId),
    );
    const resolvedMetadata = await Promise.all(metadataPromises);

    return resolvedMetadata.filter(
      (metadata): metadata is PartialObjectMetadata => !!metadata,
    );
  }

  createRelationMetadata(
    metadata: typeof BaseObjectMetadata,
    workspaceId: string,
    objectMetadataFromDB: Record<string, MappedObjectMetadataEntity>,
  ) {
    const objectMetadata = TypedReflect.getMetadata('objectMetadata', metadata);
    const relationMetadata = TypedReflect.getMetadata(
      'relationMetadata',
      metadata,
    );

    if (!relationMetadata || !objectMetadata) return [];

    return relationMetadata.map((relation) => {
      const fromObjectMetadata =
        objectMetadataFromDB[relation.fromObjectNameSingular];

      assert(
        fromObjectMetadata,
        `Object ${relation.fromObjectNameSingular} not found in DB 
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const toObjectMetadata =
        objectMetadataFromDB[relation.toObjectNameSingular];

      assert(
        toObjectMetadata,
        `Object ${relation.toObjectNameSingular} not found in DB
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const fromFieldMetadata =
        fromObjectMetadata?.fields[relation.fromFieldMetadataName];

      assert(
        fromFieldMetadata,
        `Field ${relation.fromFieldMetadataName} not found in object ${relation.fromObjectNameSingular}
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      const toFieldMetadata =
        toObjectMetadata?.fields[relation.toFieldMetadataName];

      assert(
        toFieldMetadata,
        `Field ${relation.toFieldMetadataName} not found in object ${relation.toObjectNameSingular}
        for relation defined in class ${objectMetadata.nameSingular}`,
      );

      return {
        relationType: relation.type,
        fromObjectMetadataId: fromObjectMetadata?.id,
        toObjectMetadataId: toObjectMetadata?.id,
        fromFieldMetadataId: fromFieldMetadata?.id,
        toFieldMetadataId: toFieldMetadata?.id,
        workspaceId,
      };
    });
  }

  createRelationMetadataCollection(
    metadataCollection: (typeof BaseObjectMetadata)[],
    workspaceId: string,
    objectMetadataFromDB: Record<string, MappedObjectMetadataEntity>,
  ) {
    return metadataCollection.flatMap((metadata) =>
      this.createRelationMetadata(metadata, workspaceId, objectMetadataFromDB),
    );
  }
}
