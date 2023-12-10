import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';
import { RelationMetadataInterface } from 'src/metadata/field-metadata/interfaces/relation-metadata.interface';

import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { TypeDefinitionsStorage } from 'src/workspace/workspace-schema-builder/storages/type-definitions.storage';
import { RelationDirection } from 'src/workspace/utils/deduce-relation-direction.util';

import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class RelationTypeFactory {
  private readonly logger = new Logger(RelationTypeFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    relationMetadata: RelationMetadataInterface,
    relationDirection: RelationDirection,
  ): GraphQLOutputType {
    let relationQqlType: GraphQLOutputType | undefined = undefined;

    if (
      relationDirection === RelationDirection.FROM &&
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY
    ) {
      relationQqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
        relationMetadata.toObjectMetadataId,
        ObjectTypeDefinitionKind.Connection,
      );
    } else {
      const relationObjectId =
        relationDirection === RelationDirection.FROM
          ? relationMetadata.toObjectMetadataId
          : relationMetadata.fromObjectMetadataId;

      relationQqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
        relationObjectId,
        ObjectTypeDefinitionKind.Plain,
      );
    }

    if (!relationQqlType) {
      this.logger.error(
        `Could not find a relation type for ${fieldMetadata.id}`,
        {
          fieldMetadata,
        },
      );

      throw new Error(`Could not find a relation type for ${fieldMetadata.id}`);
    }

    return relationQqlType;
  }
}
