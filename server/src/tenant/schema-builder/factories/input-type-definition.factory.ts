import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { encodeTarget } from 'src/tenant/schema-builder/utils/target.util';
import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

import { InputTypeFactory, InputTypeKind } from './input-type.factory';

export interface InputTypeDefinition {
  target: string;
  type: GraphQLInputObjectType;
  isAbstract: boolean;
}

@Injectable()
export class InputTypeDefinitionFactory {
  constructor(private readonly inputTypeFactory: InputTypeFactory) {}

  public create(
    metadata: IObjectMetadata,
    kind: InputTypeKind,
    options: BuildSchemaOptions,
  ): InputTypeDefinition {
    return {
      target: encodeTarget({
        id: metadata.id,
        kind,
      }),
      type: new GraphQLInputObjectType({
        name: `${pascalCase(metadata.nameSingular)}${kind.toString()}Input`,
        description: metadata.description,
        fields: this.generateFields(metadata, kind, options),
      }),
      // TODO: For later use
      isAbstract: false,
    };
  }

  private generateFields(
    metadata: IObjectMetadata,
    kind: InputTypeKind,
    options: BuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    metadata.fields.forEach((field: FieldMetadata) => {
      const type = this.inputTypeFactory.create(field, kind, options, {
        nullable: field.isNullable,
      });

      fields[field.name] = {
        type,
        description: field.description,
        // TODO: Add default value
        defaultValue: undefined,
      };
    });

    return fields;
  }
}
