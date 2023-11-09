import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

import { OutputTypeFactory } from './output-type.factory';

export enum ObjectTypeDefinitionKind {
  Connection = 'Connection',
  Edge = 'Edge',
  Plain = '',
}

export interface ObjectTypeDefinition {
  target: string;
  kind: ObjectTypeDefinitionKind;
  type: GraphQLObjectType;
}

@Injectable()
export class ObjectTypeDefinitionFactory {
  constructor(private readonly outputTypeFactory: OutputTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    kind: ObjectTypeDefinitionKind,
    options: BuildSchemaOptions,
  ): ObjectTypeDefinition {
    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: this.generateFields(objectMetadata, kind, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    kind: ObjectTypeDefinitionKind,
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    objectMetadata.fields.forEach((fieldMetadata: FieldMetadata) => {
      const type = this.outputTypeFactory.create(fieldMetadata, kind, options, {
        nullable: fieldMetadata.isNullable,
      });

      fields[fieldMetadata.name] = {
        type,
        description: fieldMetadata.description,
      };
    });

    return fields;
  }
}
