import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigArgumentMap } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ArgsMetadata } from 'src/tenant/schema-builder/interfaces/param-metadata.interface';

import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { TypeMapperService } from 'src/tenant/schema-builder/services/type-mapper.service';

@Injectable()
export class ArgsFactory {
  private readonly logger = new Logger(ArgsFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public create(
    { args, objectMetadata }: ArgsMetadata,
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigArgumentMap {
    const fieldConfigMap: GraphQLFieldConfigArgumentMap = {};

    for (const key in args) {
      if (!args.hasOwnProperty(key)) {
        continue;
      }
      const arg = args[key];

      // Argument is a scalar type
      if (arg.type) {
        const fieldType = this.typeMapperService.mapToScalarType(
          arg.type,
          options.dateScalarMode,
          options.numberScalarMode,
        );

        if (!fieldType) {
          this.logger.error(
            `Could not find a GraphQL type for ${arg.type.toString()}`,
            {
              arg,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL type for ${arg.type.toString()}`,
          );
        }

        const gqlType = this.typeMapperService.mapToGqlType(fieldType, {
          defaultValue: arg.defaultValue,
          nullable: arg.isNullable,
          isArray: arg.isArray,
        });

        fieldConfigMap[key] = {
          type: gqlType,
        };
      }

      // Argument is an input type
      if (arg.kind) {
        const inputType = this.typeDefinitionsStorage.getInputTypeByKey(
          objectMetadata.id,
          arg.kind,
        );

        if (!inputType) {
          this.logger.error(
            `Could not find a GraphQL input type for ${objectMetadata.id}`,
            {
              objectMetadata,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL input type for ${objectMetadata.id}`,
          );
        }

        const gqlType = this.typeMapperService.mapToGqlType(inputType, {
          nullable: arg.isNullable,
          isArray: arg.isArray,
        });

        fieldConfigMap[key] = {
          type: gqlType,
        };
      }
    }

    return fieldConfigMap;
  }
}
