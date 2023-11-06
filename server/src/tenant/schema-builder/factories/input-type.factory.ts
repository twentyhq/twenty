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
export class InputTypeFactory {
  private readonly logger = new Logger(InputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    kind: InputTypeDefinitionKind,
    buildOtions: BuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLInputType {
    let inputType: GraphQLInputType | undefined =
      this.typeMapperService.mapToScalarType(
        fieldMetadata.type,
        buildOtions.dateScalarMode,
        buildOtions.numberScalarMode,
      );

    if (!inputType) {
      inputType = this.typeDefinitionsStorage.getInputTypeByKey(
        fieldMetadata.type.toString(),
        kind,
      );

      if (!inputType) {
        this.logger.error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
          {
            fieldMetadata,
            kind,
            buildOtions,
            typeOptions,
          },
        );

        throw new Error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
        );
      }
    }

    return this.typeMapperService.mapToGqlType(inputType, typeOptions);
  }
}
