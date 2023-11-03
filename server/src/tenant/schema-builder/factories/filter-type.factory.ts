import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/tenant/schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';

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
    buildOtions: BuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLInputType {
    let filterType = this.typeMapperService.mapToFilterType(
      fieldMetadata.type,
      buildOtions.dateScalarMode,
      buildOtions.numberScalarMode,
    );

    if (!filterType) {
      filterType = this.typeDefinitionsStorage.getInputTypeByKey(
        fieldMetadata.type.toString(),
        InputTypeDefinitionKind.Filter,
      );

      if (!filterType) {
        this.logger.error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
          {
            fieldMetadata,
            buildOtions,
            typeOptions,
          },
        );

        throw new Error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
        );
      }
    }

    return this.typeMapperService.mapToGqlType(filterType, typeOptions);
  }
}
