import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { FieldMetadataDefaultSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  STANDARD_OBJECT_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { createRelationDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  STANDARD_OBJECT_IDS.timelineActivity,
  STANDARD_OBJECT_IDS.favorite,
  STANDARD_OBJECT_IDS.attachment,
  STANDARD_OBJECT_IDS.noteTarget,
  STANDARD_OBJECT_IDS.taskTarget,
];

@Injectable()
export class ObjectMetadataFieldRelationService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  public async createRelationsAndForeignKeysMetadata(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
  ) {
    const relatedObjectMetadataCollection = await Promise.all(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
        async (relationObjectMetadataStandardId) =>
          this.createRelationAndForeignKeyMetadata(
            workspaceId,
            sourceObjectMetadata,
            relationObjectMetadataStandardId,
          ),
      ),
    );

    return relatedObjectMetadataCollection;
  }

  private async createRelationAndForeignKeyMetadata(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    relationObjectMetadataStandardId: string,
  ) {
    const targetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        standardId: relationObjectMetadataStandardId,
        workspaceId: workspaceId,
        isCustom: false,
      });

    await this.createFieldMetadataRelation(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    return targetObjectMetadata;
  }

  private async createFieldMetadataRelation(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadata: ObjectMetadataEntity,
  ): Promise<FieldMetadataEntity<FieldMetadataType.RELATION>[]> {
    const sourceFieldMetadata = this.createSourceFieldMetadata(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    const targetFieldMetadata = this.createTargetFieldMetadata(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    return this.fieldMetadataRepository.save([
      {
        ...sourceFieldMetadata,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          onDelete: RelationOnDeleteAction.CASCADE,
        },
        relationTargetObjectMetadataId: targetObjectMetadata.id,
        relationTargetFieldMetadataId: targetFieldMetadata.id,
      } as Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>,
      {
        ...targetFieldMetadata,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: `${sourceObjectMetadata.nameSingular}Id`,
        },
        relationTargetObjectMetadataId: sourceObjectMetadata.id,
        relationTargetFieldMetadataId: sourceFieldMetadata.id,
      } as Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>,
    ]);
  }

  public async updateRelationsAndForeignKeysMetadata(
    workspaceId: string,
    updatedObjectMetadata: ObjectMetadataEntity,
  ): Promise<
    {
      targetObjectMetadata: ObjectMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
    }[]
  > {
    return await Promise.all(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
        async (relationObjectMetadataStandardId) =>
          this.updateRelationAndForeignKeyMetadata(
            workspaceId,
            updatedObjectMetadata,
            relationObjectMetadataStandardId,
          ),
      ),
    );
  }

  private async updateRelationAndForeignKeyMetadata(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadataStandardId: string,
  ) {
    const targetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        standardId: targetObjectMetadataStandardId,
        workspaceId: workspaceId,
        isCustom: false,
      });

    const targetFieldMetadataUpdateData = this.updateTargetFieldMetadata(
      sourceObjectMetadata,
      targetObjectMetadata,
    );
    const targetFieldMetadataToUpdate =
      await this.fieldMetadataRepository.findOneByOrFail({
        standardId: createRelationDeterministicUuid({
          objectId: sourceObjectMetadata.id,
          standardId:
            STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom,
        }),
        objectMetadataId: targetObjectMetadata.id,
        workspaceId: workspaceId,
      });

    const isTargetFieldMetadataManyToOneRelation =
      (
        targetFieldMetadataToUpdate as FieldMetadataEntity<FieldMetadataType.RELATION>
      ).settings?.relationType === RelationType.MANY_TO_ONE;

    const targetFieldMetadata = await this.fieldMetadataRepository.save({
      id: targetFieldMetadataToUpdate.id,
      ...targetFieldMetadataUpdateData,
      settings: {
        ...(targetFieldMetadataToUpdate.settings as FieldMetadataDefaultSettings),
        ...(isTargetFieldMetadataManyToOneRelation
          ? {
              joinColumnName: `${sourceObjectMetadata.nameSingular}Id`,
            }
          : {}),
      },
    });

    const sourceFieldMetadataUpdateData = this.updateSourceFieldMetadata(
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    const sourceFieldMetadataToUpdate =
      await this.fieldMetadataRepository.findOneByOrFail({
        standardId:
          CUSTOM_OBJECT_STANDARD_FIELD_IDS[targetObjectMetadata.namePlural],
        objectMetadataId: sourceObjectMetadata.id,
        workspaceId: workspaceId,
      });

    const isSourceFieldMetadataManyToOneRelation =
      (
        sourceFieldMetadataToUpdate as FieldMetadataEntity<FieldMetadataType.RELATION>
      ).settings?.relationType === RelationType.MANY_TO_ONE;

    const sourceFieldMetadata = await this.fieldMetadataRepository.save({
      id: sourceFieldMetadataToUpdate.id,
      ...sourceFieldMetadataUpdateData,
      settings: {
        ...(sourceFieldMetadataToUpdate.settings as FieldMetadataDefaultSettings),
        ...(isSourceFieldMetadataManyToOneRelation
          ? {
              joinColumnName: `${targetObjectMetadata.nameSingular}Id`,
            }
          : {}),
      },
    });

    return {
      targetObjectMetadata,
      targetFieldMetadata,
      sourceFieldMetadata,
    };
  }

  private createSourceFieldMetadata(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadata: ObjectMetadataEntity,
  ): Partial<FieldMetadataEntity<FieldMetadataType.RELATION>> {
    const relationObjectMetadataNamePlural = targetObjectMetadata.namePlural;

    const { description } = buildDescriptionForRelationFieldMetadataOnFromField(
      {
        relationObjectMetadataNamePlural,
        targetObjectLabelSingular: sourceObjectMetadata.labelSingular,
      },
    );

    return {
      id: uuidV4(),
      standardId:
        CUSTOM_OBJECT_STANDARD_FIELD_IDS[relationObjectMetadataNamePlural],
      objectMetadataId: sourceObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      name: targetObjectMetadata.namePlural,
      label: capitalize(relationObjectMetadataNamePlural),
      description,
      icon:
        STANDARD_OBJECT_ICONS[targetObjectMetadata.nameSingular] ||
        'IconBuildingSkyscraper',
      isNullable: true,
    };
  }

  private updateSourceFieldMetadata(
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadata: ObjectMetadataEntity,
  ) {
    const relationObjectMetadataNamePlural = targetObjectMetadata.namePlural;

    const { description } = buildDescriptionForRelationFieldMetadataOnFromField(
      {
        relationObjectMetadataNamePlural,
        targetObjectLabelSingular: sourceObjectMetadata.labelSingular,
      },
    );

    return {
      description,
    };
  }

  private createTargetFieldMetadata(
    workspaceId: string,
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadata: ObjectMetadataEntity,
  ): Partial<FieldMetadataEntity<FieldMetadataType.RELATION>> {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${targetObjectMetadata.nameSingular}`,
      );
    }

    const { description } = buildDescriptionForRelationFieldMetadataOnToField({
      relationObjectMetadataNamePlural: targetObjectMetadata.namePlural,
      targetObjectLabelSingular: sourceObjectMetadata.labelSingular,
    });

    return {
      id: uuidV4(),
      name: sourceObjectMetadata.nameSingular,
      label: sourceObjectMetadata.labelSingular,
      description,
      standardId: createRelationDeterministicUuid({
        objectId: sourceObjectMetadata.id,
        standardId: customStandardFieldId,
      }),
      objectMetadataId: targetObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
    };
  }

  private updateTargetFieldMetadata(
    sourceObjectMetadata: ObjectMetadataEntity,
    targetObjectMetadata: ObjectMetadataEntity,
  ) {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${targetObjectMetadata.nameSingular}`,
      );
    }

    const { description } = buildDescriptionForRelationFieldMetadataOnToField({
      relationObjectMetadataNamePlural: targetObjectMetadata.namePlural,
      targetObjectLabelSingular: sourceObjectMetadata.labelSingular,
    });

    return {
      name: sourceObjectMetadata.nameSingular,
      label: sourceObjectMetadata.labelSingular,
      description,
    };
  }
}
