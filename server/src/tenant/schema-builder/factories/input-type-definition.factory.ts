import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isCompositeFieldMetadataType } from 'src/tenant/utils/is-composite-field-metadata-type.util';

import { InputTypeFactory } from './input-type.factory';

export enum InputTypeDefinitionKind {
  Create = 'Create',
  Update = 'Update',
  Filter = 'Filter',
  OrderBy = 'OrderBy',
}

export interface InputTypeDefinition {
  target: string;
  kind: InputTypeDefinitionKind;
  type: GraphQLInputObjectType;
}

@Injectable()
export class InputTypeDefinitionFactory {
  constructor(private readonly inputTypeFactory: InputTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    kind: InputTypeDefinitionKind,
    options: BuildSchemaOptions,
  ): InputTypeDefinition {
    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(
          objectMetadata.nameSingular,
        )}${kind.toString()}Input`,
        description: objectMetadata.description,
        fields: this.generateFields(objectMetadata, kind, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    kind: InputTypeDefinitionKind,
    options: BuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Composite field types are generated during extensin of object type definition
      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        //continue;
      }

      const type = this.inputTypeFactory.create(fieldMetadata, kind, options, {
        nullable: fieldMetadata.isNullable,
      });

      fields[fieldMetadata.name] = {
        type,
        description: fieldMetadata.description,
        // TODO: Add default value
        defaultValue: undefined,
      };
    }

    return fields;
  }
}
