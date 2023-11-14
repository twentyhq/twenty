import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLObjectType,
} from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { objectContainsCompositeField } from 'src/tenant/schema-builder/utils/object-contains-composite-field';
import { getResolverArgs } from 'src/tenant/schema-builder/utils/get-resolver-args.util';
import { isCompositeFieldMetadataType } from 'src/tenant/utils/is-composite-field-metadata-type.util';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/tenant/utils/deduce-relation-direction.util';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

import { RelationTypeFactory } from './relation-type.factory';
import { ArgsFactory } from './args.factory';

export enum ObjectTypeDefinitionKind {
  Connection = 'Connection',
  Edge = 'Edge',
  Plain = '',
}

export interface ObjectTypeDefinition {
  target: string;
  kind: ObjectTypeDefinitionKind;
  type: GraphQLObjectType;
}

@Injectable()
export class ExtendObjectTypeDefinitionFactory {
  private readonly logger = new Logger(ExtendObjectTypeDefinitionFactory.name);

  constructor(
    private readonly relationTypeFactory: RelationTypeFactory,
    private readonly argsFactory: ArgsFactory,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): ObjectTypeDefinition {
    const kind = ObjectTypeDefinitionKind.Plain;
    const gqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
      objectMetadata.id,
      kind,
    );
    const containsCompositeField = objectContainsCompositeField(objectMetadata);

    if (!gqlType) {
      this.logger.error(
        `Could not find a GraphQL type for ${objectMetadata.id.toString()}`,
        {
          objectMetadata,
          options,
        },
      );

      throw new Error(
        `Could not find a GraphQL type for ${objectMetadata.id.toString()}`,
      );
    }

    // Security check to avoid extending an object that does not need to be extended
    if (!containsCompositeField) {
      this.logger.error(
        `This object does not need to be extended: ${objectMetadata.id.toString()}`,
        {
          objectMetadata,
          options,
        },
      );

      throw new Error(
        `This object does not need to be extended: ${objectMetadata.id.toString()}`,
      );
    }

    // Extract current object config to extend it
    const config = gqlType.toConfig();

    // Recreate the same object type with the new fields
    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        ...config,
        fields: () => ({
          ...config.fields,
          ...this.generateFields(objectMetadata, options),
        }),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Ignore non composite fields as they are already defined
      if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      switch (fieldMetadata.type) {
        case FieldMetadataType.RELATION: {
          const relationMetadata =
            fieldMetadata.fromRelationMetadata ??
            fieldMetadata.toRelationMetadata;

          if (!relationMetadata) {
            this.logger.error(
              `Could not find a relation metadata for ${fieldMetadata.id}`,
              {
                fieldMetadata,
              },
            );

            throw new Error(
              `Could not find a relation metadata for ${fieldMetadata.id}`,
            );
          }

          const relationDirection = deduceRelationDirection(
            fieldMetadata.objectMetadataId,
            relationMetadata,
          );
          const relationType = this.relationTypeFactory.create(
            fieldMetadata,
            relationMetadata,
            relationDirection,
          );
          let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

          // Args are only needed when relation is of kind `oneToMany` and the relation direction is `from`
          if (
            relationMetadata.relationType ===
              RelationMetadataType.ONE_TO_MANY &&
            relationDirection === RelationDirection.FROM
          ) {
            const args = getResolverArgs('findMany');

            argsType = this.argsFactory.create(
              {
                args,
                objectMetadata: relationMetadata.toObjectMetadata,
              },
              options,
            );
          }

          fields[fieldMetadata.name] = {
            type: relationType,
            args: argsType,
            description: fieldMetadata.description,
          };
          break;
        }
      }
    }

    return fields;
  }
}
