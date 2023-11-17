import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/workspace/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isCompositeFieldMetadataType } from 'src/workspace/utils/is-composite-field-metadata-type.util';

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
    options: WorkspaceBuildSchemaOptions,
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
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Composite field types are generated during extension of object type definition
      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        //continue;
      }

      const type = this.inputTypeFactory.create(fieldMetadata, kind, options, {
        nullable: fieldMetadata.isNullable,
        defaultValue: fieldMetadata.defaultValue,
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
