import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { ReflectRelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  create(
    reflectRelationMetadataCollection: ReflectRelationMetadata[],
  ): EntitySchemaRelationMap {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    for (const reflectRelationMetadata of reflectRelationMetadataCollection) {
      // TODO: We should implement the opposite side of the relation
      const target = reflectRelationMetadata.inverseSideTarget();
      const objectName = convertClassNameToObjectMetadataName(target.name);
      let relationType: RelationType = 'one-to-many';

      switch (reflectRelationMetadata.type) {
        case RelationMetadataType.ONE_TO_MANY:
          relationType = 'one-to-many';
          break;
        case RelationMetadataType.ONE_TO_ONE:
          relationType = 'one-to-one';
          break;
        case RelationMetadataType.MANY_TO_MANY:
          relationType = 'many-to-many';
          break;
      }

      entitySchemaRelationMap[reflectRelationMetadata.fieldKey] = {
        type: relationType,
        target: () => objectName,
      };
    }

    return entitySchemaRelationMap;
  }
}
