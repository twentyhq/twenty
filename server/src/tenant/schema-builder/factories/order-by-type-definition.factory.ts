import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { FieldMetadataEntity } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from './input-type-definition.factory';
import { OrderByTypeFactory } from './order-by-type.factory';

@Injectable()
export class OrderByTypeDefinitionFactory {
  constructor(private readonly orderByTypeFactory: OrderByTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): InputTypeDefinition {
    const kind = InputTypeDefinitionKind.OrderBy;

    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(
          objectMetadata.nameSingular,
        )}${kind.toString()}Input`,
        description: objectMetadata.description,
        fields: this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    objectMetadata.fields.forEach((fieldMetadata: FieldMetadataEntity) => {
      const type = this.orderByTypeFactory.create(fieldMetadata, options, {
        nullable: fieldMetadata.isNullable,
      });

      fields[fieldMetadata.name] = {
        type,
        description: fieldMetadata.description,
        // TODO: Add default value
        defaultValue: undefined,
      };
    });

    return fields;
  }
}
