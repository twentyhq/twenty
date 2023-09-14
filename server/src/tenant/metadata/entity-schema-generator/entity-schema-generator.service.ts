import { Injectable } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

import { ObjectMetadataService } from 'src/tenant/metadata/object-metadata/object-metadata.service';

import { baseColumns } from './base.entity';
import {
  convertFieldTypeToPostgresType,
  sanitizeColumnName,
} from './entity-schema-generator.util';

@Injectable()
export class EntitySchemaGeneratorService {
  constructor(private readonly objectMetadataService: ObjectMetadataService) {}

  async getTypeORMEntitiesByDataSourceId(dataSourceId: string) {
    const objectMetadata =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        dataSourceId,
      );

    const entities = objectMetadata.map((object) => {
      return new EntitySchema({
        name: object.name,
        columns: {
          ...baseColumns,
          ...object.fields.reduce((columns, field) => {
            return {
              ...columns,
              [sanitizeColumnName(field.name)]: {
                type: convertFieldTypeToPostgresType(field.type),
                nullable: true,
              },
            };
          }, {}),
        },
      });
    });

    return entities;
  }
}
