import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/workspace/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { TypeMapperService } from 'src/workspace/workspace-schema-builder/services/type-mapper.service';
import { isRelationFieldMetadataType } from 'src/workspace/utils/is-relation-field-metadata-type.util';

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
    options: WorkspaceBuildSchemaOptions,
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
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Relation types are generated during extension of object type definition
      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const type = this.filterTypeFactory.create(fieldMetadata, options, {
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
