import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';
import { encodeTarget } from 'src/tenant/schema-builder/utils/target.util';
import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

import { OutputTypeFactory } from './output-type.factory';

export interface ObjectTypeDefinition {
  target: string;
  type: GraphQLObjectType;
  isAbstract: boolean;
}

@Injectable()
export class ObjectTypeDefinitionFactory {
  constructor(private readonly outputTypeFactory: OutputTypeFactory) {}

  public create(
    metadata: IObjectMetadata,
    options: BuildSchemaOptions,
  ): ObjectTypeDefinition {
    return {
      target: encodeTarget({
        id: metadata.id,
      }),
      type: new GraphQLObjectType({
        name: `${pascalCase(metadata.nameSingular)}`,
        description: metadata.description,
        fields: this.generateFields(metadata, options),
      }),
      // TODO: For later use
      isAbstract: false,
    };
  }

  private generateFields(
    metadata: IObjectMetadata,
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    metadata.fields.forEach((field: FieldMetadata) => {
      const type = this.outputTypeFactory.create(field, options, {
        nullable: field.isNullable,
      });

      fields[field.name] = {
        type,
        description: field.description,
      };
    });

    return fields;
  }
}
