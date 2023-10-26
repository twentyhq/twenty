import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigArgumentMap } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

import { InputTypeFactory, InputTypeKind } from './input-type.factory';

@Injectable()
export class ArgsFactory {
  constructor(private readonly inputTypeFactory: InputTypeFactory) {}

  public create(metadata: IObjectMetadata, options: BuildSchemaOptions) {
    const fieldConfigMap: GraphQLFieldConfigArgumentMap = {};

    metadata.fields.forEach((field: FieldMetadata) => {
      const type = this.inputTypeFactory.create(
        field,
        InputTypeKind.Create,
        options,
        {
          nullable: field.isNullable,
        },
      );

      fieldConfigMap[field.name] = {
        type,
        description: field.description,
        // TODO: Add default value
        defaultValue: undefined,
      };
    });

    return fieldConfigMap;
  }
}
