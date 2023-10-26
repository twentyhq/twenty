import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/tenant/schema-builder/services/type-mapper.service';
import { IFieldMetadata } from 'src/tenant/schema-builder/metadata/field.metadata';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { encodeTarget } from 'src/tenant/schema-builder/utils/target.util';

@Injectable()
export class OutputTypeFactory {
  private readonly logger = new Logger(OutputTypeFactory.name);

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: IFieldMetadata,
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
      const target = encodeTarget({ id: fieldMetadata.type.toString() });

      gqlType = this.typeDefinitionsStorage.getObjectTypeByTarget(target);

      if (!gqlType) {
        this.logger.error(`Could not find a GraphQL type for ${target}`, {
          fieldMetadata,
          buildOtions,
          typeOptions,
        });

        throw new Error(
          `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
        );
      }
    }

    return this.typeMapperService.mapToGqlType(gqlType, typeOptions);
  }
}
