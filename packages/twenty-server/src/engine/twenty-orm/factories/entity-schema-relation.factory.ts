import { Injectable, Type } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';
import { RelationType } from 'typeorm/metadata/types/RelationTypes';

import { ReflectRelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { TypedReflect } from 'src/utils/typed-reflect';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  create(
    target: Type,
    reflectRelationMetadataCollection: ReflectRelationMetadata[],
  ): EntitySchemaRelationMap {
    const objectName = convertClassNameToObjectMetadataName(target.name);
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    /**
     * 
     * ACTIVITY
     *   @FieldMetadata({
    standardId: activityStandardFieldIds.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Activity attachments',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  attachments: AttachmentObjectMetadata[];

  ATTACHMENTS

    @FieldMetadata({
    standardId: attachmentStandardFieldIds.activity,
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Attachment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  activity: ActivityObjectMetadata;
     */

    for (const reflectRelationMetadata of reflectRelationMetadataCollection) {
      const oppositeTarget = reflectRelationMetadata.inverseSideTarget();
      const oppositeObjectName = convertClassNameToObjectMetadataName(
        oppositeTarget.name,
      );
      const oppositeReflectFieldMetadataMap = TypedReflect.getMetadata(
        'fieldMetadataMap',
        oppositeTarget,
      );
      const oppositeReflectFieldMetadata = Object.values(
        oppositeReflectFieldMetadataMap ?? {},
      ).find((reflectFieldMetadata) => {
        if (reflectFieldMetadata.type !== FieldMetadataType.RELATION) {
          return false;
        }

        return (
          reflectFieldMetadata.joinColumn === reflectRelationMetadata.fieldKey
        );
      });

      const relationType = this.getRelationType(reflectRelationMetadata);

      entitySchemaRelationMap[reflectRelationMetadata.fieldKey] = {
        type: relationType,
        target: () => oppositeObjectName,
        inverseSide: objectName,
        joinColumn: oppositeReflectFieldMetadata?.joinColumn
          ? {
              name: oppositeReflectFieldMetadata.joinColumn,
              referencedColumnName: 'id',
            }
          : undefined,
      };

      // // TODO: Not working for now as we can have names that doens't match the object name
      // // To fix that we should totally refactor @RelationMetadata decorator and RelationMetadata
      // if (oppositeReflectFieldMetadata) {
      //   entitySchemaRelationMap[oppositeReflectFieldMetadata.name] = {
      //     type: relationType === 'one-to-many' ? 'many-to-one' : relationType,
      //     target: () => objectName,
      //     inverseSide: oppositeObjectName,
      //     joinColumn: {
      //       name: oppositeReflectFieldMetadata.joinColumn,
      //       referencedColumnName: 'id',
      //     },
      //   };
      // }
    }

    return entitySchemaRelationMap;
  }

  private getRelationType(
    reflectRelationMetadata: ReflectRelationMetadata,
  ): RelationType {
    switch (reflectRelationMetadata.type) {
      case RelationMetadataType.ONE_TO_MANY:
        return 'one-to-many';
      case RelationMetadataType.ONE_TO_ONE:
        return 'one-to-one';
      case RelationMetadataType.MANY_TO_MANY:
        return 'many-to-many';
      default:
        throw new Error('Invalid relation type');
    }
  }
}
