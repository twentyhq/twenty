import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  create(
    relationMetadataArgsCollection: WorkspaceRelationMetadataArgs[],
  ): EntitySchemaRelationMap {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    for (const relationMetadataArgs of relationMetadataArgsCollection) {
      const oppositeTarget = relationMetadataArgs.inverseSideTarget();
      const oppositeObjectName = convertClassNameToObjectMetadataName(
        oppositeTarget.name,
      );

      const relationType = this.getRelationType(relationMetadataArgs);

      entitySchemaRelationMap[relationMetadataArgs.name] = {
        type: relationType,
        target: oppositeObjectName,
        inverseSide: relationMetadataArgs.inverseSideFieldKey,
        joinColumn: relationMetadataArgs.joinColumn
          ? {
              name: relationMetadataArgs.joinColumn,
            }
          : undefined,
      };
    }

    return entitySchemaRelationMap;
  }

  private getRelationType(
    relationMetadataArgs: WorkspaceRelationMetadataArgs,
  ): RelationType {
    switch (relationMetadataArgs.type) {
      case RelationMetadataType.ONE_TO_MANY:
        return 'one-to-many';
      case RelationMetadataType.MANY_TO_ONE:
        return 'many-to-one';
      case RelationMetadataType.ONE_TO_ONE:
        return 'one-to-one';
      case RelationMetadataType.MANY_TO_MANY:
        return 'many-to-many';
      default:
        throw new Error('Invalid relation type');
    }
  }
}
