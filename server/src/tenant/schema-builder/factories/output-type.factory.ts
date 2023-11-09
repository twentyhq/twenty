import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/tenant/schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';

import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class OutputTypeFactory {
  private readonly logger = new Logger(OutputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    kind: ObjectTypeDefinitionKind,
    buildOtions: BuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLOutputType {
    let gqlType: GraphQLOutputType | undefined =
      this.typeMapperService.mapToScalarType(
        fieldMetadata.type,
        buildOtions.dateScalarMode,
        buildOtions.numberScalarMode,
      );

    if (!gqlType) {
      gqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
        fieldMetadata.type.toString(),
        kind,
      );

      if (!gqlType) {
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

    return this.typeMapperService.mapToGqlType(gqlType, typeOptions);
  }
}
