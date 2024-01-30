import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLScalarType,
} from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/workspace/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/workspace/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/workspace/workspace-schema-builder/storages/type-definitions.storage';
import { isCompositeFieldMetadataType } from 'src/metadata/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/metadata/field-metadata/utils/is-enum-field-metadata-type.util';
import { FilterIs } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is.input-type';

import { InputTypeDefinitionKind } from './input-type-definition.factory';

@Injectable()
export class FilterTypeFactory {
  private readonly logger = new Logger(FilterTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    buildOptions: WorkspaceBuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLInputType {
    const target = isCompositeFieldMetadataType(fieldMetadata.type)
      ? fieldMetadata.type.toString()
      : fieldMetadata.id;
    let filterType: GraphQLInputObjectType | GraphQLScalarType | undefined =
      undefined;

    if (isEnumFieldMetadataType(fieldMetadata.type)) {
      filterType = this.createEnumFilterType(fieldMetadata);
    } else {
      filterType = this.typeMapperService.mapToFilterType(
        fieldMetadata.type,
        buildOptions.dateScalarMode,
        buildOptions.numberScalarMode,
      );

      filterType ??= this.typeDefinitionsStorage.getInputTypeByKey(
        target,
        InputTypeDefinitionKind.Filter,
      );
    }

    if (!filterType) {
      this.logger.error(`Could not find a GraphQL type for ${target}`, {
        fieldMetadata,
        buildOptions,
        typeOptions,
      });

      throw new Error(`Could not find a GraphQL type for ${target}`);
    }

    return this.typeMapperService.mapToGqlType(filterType, typeOptions);
  }

  private createEnumFilterType(
    fieldMetadata: FieldMetadataInterface,
  ): GraphQLInputObjectType {
    const enumType = this.typeDefinitionsStorage.getEnumTypeByKey(
      fieldMetadata.id,
    );

    if (!enumType) {
      this.logger.error(
        `Could not find a GraphQL enum type for ${fieldMetadata.id}`,
        {
          fieldMetadata,
        },
      );

      throw new Error(
        `Could not find a GraphQL enum type for ${fieldMetadata.id}`,
      );
    }

    return new GraphQLInputObjectType({
      name: `${enumType.name}Filter`,
      fields: () => ({
        eq: { type: enumType },
        neq: { type: enumType },
        in: { type: new GraphQLList(enumType) },
        is: { type: FilterIs },
      }),
    });
  }
}
