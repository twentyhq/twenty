import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  ATTACHMENT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  NOTE_TARGET_STANDARD_FIELD_IDS,
  TASK_TARGET_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { capitalize } from 'src/utils/capitalize';

@Injectable()
export class ObjectMetadataRelationService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
  ) {}

  async createRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    relationType: string,
  ) {
    const relatedObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: relationType,
        workspaceId: workspaceId,
      });

    await this.createForeignKey(
      workspaceId,
      createdObjectMetadata,
      relatedObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
    );

    const relationFieldMetadata = await this.createRelationFields(
      workspaceId,
      createdObjectMetadata,
      relatedObjectMetadata,
      relationType,
    );

    await this.createRelationMetadata(
      workspaceId,
      createdObjectMetadata,
      relatedObjectMetadata,
      relationFieldMetadata,
    );

    return { [relationType + 'ObjectMetadata']: relatedObjectMetadata };
  }

  private async createForeignKey(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    await this.fieldMetadataRepository.save({
      standardId: createForeignKeyDeterministicUuid({
        objectId: createdObjectMetadata.id,
        standardId: this.getStandardFieldId(relatedObjectMetadata.nameSingular),
      }),
      objectMetadataId: relatedObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      type: objectPrimaryKeyType,
      name: `${createdObjectMetadata.nameSingular}Id`,
      label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
      description: `${relatedObjectMetadata.labelSingular} ${createdObjectMetadata.labelSingular} id foreign key`,
      icon: undefined,
      isNullable: true,
      isSystem: true,
      defaultValue: undefined,
      settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
    });
  }

  private async createRelationFields(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    relationType: string,
  ) {
    return await this.fieldMetadataRepository.save([
      this.createFromField(workspaceId, createdObjectMetadata, relationType),
      this.createToField(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
        relationType,
      ),
    ]);
  }

  private createFromField(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relationType: string,
  ) {
    return {
      standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS[relationType + 's'],
      objectMetadataId: createdObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      name: relationType + 's',
      label: capitalize(relationType + 's'),
      description: `${capitalize(relationType + 's')} tied to the ${createdObjectMetadata.labelSingular}`,
      icon: this.getIconForRelationType(relationType),
      isNullable: true,
    };
  }

  private createToField(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    relationType: string,
  ) {
    return {
      standardId: createRelationDeterministicUuid({
        objectId: createdObjectMetadata.id,
        standardId: this.getStandardFieldId(relationType),
      }),
      objectMetadataId: relatedObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      name: createdObjectMetadata.nameSingular,
      label: createdObjectMetadata.labelSingular,
      description: `${capitalize(relationType)} ${createdObjectMetadata.labelSingular}`,
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
    };
  }

  private async createRelationMetadata(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    relationFieldMetadata: FieldMetadataEntity[],
  ) {
    const relationFieldMetadataMap = relationFieldMetadata.reduce(
      (acc, fieldMetadata: FieldMetadataEntity) => {
        if (fieldMetadata.type === FieldMetadataType.RELATION) {
          acc[fieldMetadata.objectMetadataId] = fieldMetadata;
        }

        return acc;
      },
      {},
    );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: relatedObjectMetadata.id,
        fromFieldMetadataId:
          relationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          relationFieldMetadataMap[relatedObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);
  }

  async updateObjectRelationships(objectMetadataId: string, isActive: boolean) {
    const affectedRelations = await this.relationMetadataRepository.find({
      where: [
        { fromObjectMetadataId: objectMetadataId },
        { toObjectMetadataId: objectMetadataId },
      ],
    });

    const affectedFieldIds = affectedRelations.reduce(
      (acc, { fromFieldMetadataId, toFieldMetadataId }) => {
        acc.push(fromFieldMetadataId, toFieldMetadataId);

        return acc;
      },
      [] as string[],
    );

    if (affectedFieldIds.length > 0) {
      await this.fieldMetadataRepository.update(
        { id: In(affectedFieldIds) },
        { isActive: isActive },
      );
    }
  }

  private getStandardFieldId(relationType: string) {
    const standardFieldIds = {
      timelineActivity: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
      favorite: FAVORITE_STANDARD_FIELD_IDS,
      activityTarget: ACTIVITY_TARGET_STANDARD_FIELD_IDS,
      attachment: ATTACHMENT_STANDARD_FIELD_IDS,
      noteTarget: NOTE_TARGET_STANDARD_FIELD_IDS,
      taskTarget: TASK_TARGET_STANDARD_FIELD_IDS,
    };

    return standardFieldIds[relationType]?.custom;
  }

  private getIconForRelationType(relationType: string) {
    const icons = {
      timelineActivity: 'IconTimelineEvent',
      favorite: 'IconHeart',
      activityTarget: 'IconCheckbox',
      attachment: 'IconFileImport',
      noteTarget: 'IconNotes',
      taskTarget: 'IconCheckbox',
    };

    return icons[relationType] || 'IconBuildingSkyscraper';
  }

  async createTimelineActivityRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'timelineActivity',
    );
  }

  async createFavoriteRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'favorite',
    );
  }

  async createActivityTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'activityTarget',
    );
  }

  async createAttachmentRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'attachment',
    );
  }

  async createNoteTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'noteTarget',
    );
  }

  async createTaskTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.createRelation(
      workspaceId,
      createdObjectMetadata,
      objectPrimaryKeyType,
      objectPrimaryKeyFieldSettings,
      'taskTarget',
    );
  }
}
