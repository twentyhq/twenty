import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/workspace/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/workspace/workspace-schema-builder/interfaces/field-metadata.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/workspace/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/workspace/workspace-schema-builder/storages/type-definitions.storage';

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
    buildOtions: WorkspaceBuildSchemaOptions,
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
