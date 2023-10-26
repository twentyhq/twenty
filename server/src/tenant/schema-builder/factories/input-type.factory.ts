import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/tenant/schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { encodeTarget } from 'src/tenant/schema-builder/utils/target.util';
import { IFieldMetadata } from 'src/tenant/schema-builder/metadata/field.metadata';

export enum InputTypeKind {
  Create = 'Create',
  Update = 'Update',
}

@Injectable()
export class InputTypeFactory {
  private readonly logger = new Logger(InputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: IFieldMetadata,
    kind: InputTypeKind,
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
      const target = encodeTarget({ id: fieldMetadata.type.toString(), kind });

      inputType = this.typeDefinitionsStorage.getInputTypeByTarget(target);

      if (!inputType) {
        this.logger.error(`Could not find a GraphQL type for ${target}`, {
          fieldMetadata,
          kind,
          buildOtions,
          typeOptions,
        });

        throw new Error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
        );
      }
    }

    return this.typeMapperService.mapToGqlType(inputType, typeOptions);
  }
}
