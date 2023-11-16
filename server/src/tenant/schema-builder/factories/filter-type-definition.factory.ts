import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { TypeMapperService } from 'src/tenant/schema-builder/services/type-mapper.service';
import { isCompositeFieldMetadataType } from 'src/tenant/utils/is-composite-field-metadata-type.util';

import { FilterTypeFactory } from './filter-type.factory';
import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from './input-type-definition.factory';

@Injectable()
export class FilterTypeDefinitionFactory {
  constructor(
    private readonly filterTypeFactory: FilterTypeFactory,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): InputTypeDefinition {
    const kind = InputTypeDefinitionKind.Filter;
    const filterInputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}Input`,
      description: objectMetadata.description,
      fields: () => {
        const andOrType = this.typeMapperService.mapToGqlType(filterInputType, {
          isArray: true,
          arrayDepth: 1,
          nullable: true,
        });

        return {
          ...this.generateFields(objectMetadata, options),
          and: {
            type: andOrType,
          },
          or: {
            type: andOrType,
          },
          not: {
            type: this.typeMapperService.mapToGqlType(filterInputType, {
              nullable: true,
            }),
          },
        };
      },
    });

    return {
      target: objectMetadata.id,
      kind,
      type: filterInputType,
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Composite field types are generated during extension of object type definition
      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        //continue;
      }

      const type = this.filterTypeFactory.create(fieldMetadata, options, {
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
