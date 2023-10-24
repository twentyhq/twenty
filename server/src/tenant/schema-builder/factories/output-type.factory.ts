import { Injectable } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/tenant/schema-builder/services/type-mapper.service';

@Injectable()
export class OutputTypeFactory {
  constructor(private readonly typeMapperService: TypeMapperService) {}

  public create(
    fieldMetadata: FieldMetadata,
    buildOtions: BuildSchemaOptions,
    typeOptions: TypeOptions,
  ): GraphQLOutputType {
    const gqlType: GraphQLOutputType | undefined =
      this.typeMapperService.mapToScalarType(
        fieldMetadata.type,
        buildOtions.dateScalarMode,
        buildOtions.numberScalarMode,
      );

    if (!gqlType) {
      // TODO: Handle ENUM, URL, MONEY
      throw new Error(
        `Could not find a GraphQL type for ${fieldMetadata.type.toString()}`,
      );
    }

    return this.typeMapperService.mapToGqlType(gqlType, typeOptions);
  }
}
