import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { capitalize, FieldMetadataType } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { buildNameLabelAndDescriptionForForeignKeyFieldMetadata } from 'src/engine/metadata-modules/object-metadata/utils/build-name-label-and-description-for-foreign-key-field-metadata.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import {
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  STANDARD_OBJECT_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  STANDARD_OBJECT_IDS.timelineActivity,
  STANDARD_OBJECT_IDS.favorite,
  STANDARD_OBJECT_IDS.attachment,
  STANDARD_OBJECT_IDS.noteTarget,
  STANDARD_OBJECT_IDS.taskTarget,
];

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

  public async createRelationsAndForeignKeysMetadata(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    { primaryKeyFieldMetadataSettings, primaryKeyColumnType },
  ) {
    const relatedObjectMetadataCollection = await Promise.all(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
        async (relationObjectMetadataStandardId) =>
          this.createRelationAndForeignKeyMetadata(
            workspaceId,
            createdObjectMetadata,
            mapUdtNameToFieldType(primaryKeyColumnType ?? 'uuid'),
            primaryKeyFieldMetadataSettings,
            relationObjectMetadataStandardId,
          ),
      ),
    );

    return relatedObjectMetadataCollection;
  }

  private async createRelationAndForeignKeyMetadata(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    relationObjectMetadataStandardId: string,
  ) {
    const relatedObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        standardId: relationObjectMetadataStandardId,
        workspaceId: workspaceId,
        isCustom: false,
      });

    const relationFieldMetadataCollection =
      await this.createRelationFieldMetadas(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
        objectPrimaryKeyType,
        objectPrimaryKeyFieldSettings,
      );

    await this.createRelationMetadataFromFieldMetadatas(
      workspaceId,
      createdObjectMetadata,
      relatedObjectMetadata,
      relationFieldMetadataCollection,
    );

    return relatedObjectMetadata;
  }

  private async createRelationFieldMetadas(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    return this.fieldMetadataRepository.save([
      this.buildFromFieldMetadata(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
      ),
      this.buildToFieldMetadata(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
      ),
      this.buildForeignKeyFieldMetadata(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
        objectPrimaryKeyType,
        objectPrimaryKeyFieldSettings,
      ),
    ]);
  }

  public async updateRelationsAndForeignKeysMetadata(
    workspaceId: string,
    updatedObjectMetadata: ObjectMetadataEntity,
  ): Promise<
    {
      relatedObjectMetadata: ObjectMetadataEntity;
      foreignKeyFieldMetadata: FieldMetadataEntity;
      toFieldMetadata: FieldMetadataEntity;
      fromFieldMetadata: FieldMetadataEntity;
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
    updatedObjectMetadata: ObjectMetadataEntity,
    relationObjectMetadataStandardId: string,
  ) {
    const relatedObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        standardId: relationObjectMetadataStandardId,
        workspaceId: workspaceId,
        isCustom: false,
      });

    const toFieldMetadataUpdateCriteria = {
      standardId: createRelationDeterministicUuid({
        objectId: updatedObjectMetadata.id,
        standardId:
          STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom,
      }),
      objectMetadataId: relatedObjectMetadata.id,
      workspaceId: workspaceId,
    };
    const toFieldMetadataUpdateData = this.buildToFieldMetadata(
      workspaceId,
      updatedObjectMetadata,
      relatedObjectMetadata,
      true,
    );
    const toFieldMetadataToUpdate =
      await this.fieldMetadataRepository.findOneBy(
        toFieldMetadataUpdateCriteria,
      );
    const toFieldMetadata = await this.fieldMetadataRepository.save({
      ...toFieldMetadataToUpdate,
      ...toFieldMetadataUpdateData,
    });

    const fromFieldMetadataUpdateCriteria = {
      standardId:
        CUSTOM_OBJECT_STANDARD_FIELD_IDS[relatedObjectMetadata.namePlural],
      objectMetadataId: updatedObjectMetadata.id,
      workspaceId: workspaceId,
    };
    const fromFieldMetadataUpdateData = this.buildFromFieldMetadata(
      workspaceId,
      updatedObjectMetadata,
      relatedObjectMetadata,
      true,
    );
    const fromFieldMetadataToUpdate =
      await this.fieldMetadataRepository.findOneBy(
        fromFieldMetadataUpdateCriteria,
      );
    const fromFieldMetadata = await this.fieldMetadataRepository.save({
      ...fromFieldMetadataToUpdate,
      ...fromFieldMetadataUpdateData,
    });

    const foreignKeyFieldMetadataUpdateCriteria = {
      standardId: createForeignKeyDeterministicUuid({
        objectId: updatedObjectMetadata.id,
        standardId:
          STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom,
      }),
      objectMetadataId: relatedObjectMetadata.id,
      workspaceId: workspaceId,
    };
    const foreignKeyFieldMetadataUpdateData = this.buildForeignKeyFieldMetadata(
      workspaceId,
      updatedObjectMetadata,
      relatedObjectMetadata,
      FieldMetadataType.UUID,
      undefined,
      true,
    );
    const foreignKeyFieldMetadataToUpdate =
      await this.fieldMetadataRepository.findOneBy(
        foreignKeyFieldMetadataUpdateCriteria,
      );
    const foreignKeyFieldMetadata = await this.fieldMetadataRepository.save({
      ...foreignKeyFieldMetadataToUpdate,
      ...foreignKeyFieldMetadataUpdateData,
    });

    return {
      relatedObjectMetadata,
      foreignKeyFieldMetadata,
      toFieldMetadata,
      fromFieldMetadata,
    };
  }

  private buildFromFieldMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    isUpdate = false,
  ) {
    const relationObjectMetadataNamePlural = relatedObjectMetadata.namePlural;

    const { description } = buildDescriptionForRelationFieldMetadataOnFromField(
      {
        relationObjectMetadataNamePlural,
        targetObjectLabelSingular: objectMetadata.labelSingular,
      },
    );

    return {
      description,
      ...(!isUpdate
        ? {
            standardId:
              CUSTOM_OBJECT_STANDARD_FIELD_IDS[
                relationObjectMetadataNamePlural
              ],
            objectMetadataId: objectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            isSystem: true,
            type: FieldMetadataType.RELATION,
            name: relatedObjectMetadata.namePlural,
            label: capitalize(relationObjectMetadataNamePlural),
            description,
            icon:
              STANDARD_OBJECT_ICONS[relatedObjectMetadata.nameSingular] ||
              'IconBuildingSkyscraper',
            isNullable: true,
          }
        : {}),
    };
  }

  private buildToFieldMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    isUpdate = false,
  ) {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${relatedObjectMetadata.nameSingular}`,
      );
    }

    const { description } = buildDescriptionForRelationFieldMetadataOnToField({
      relationObjectMetadataNamePlural: relatedObjectMetadata.namePlural,
      targetObjectLabelSingular: objectMetadata.labelSingular,
    });

    return {
      name: objectMetadata.nameSingular,
      label: objectMetadata.labelSingular,
      description,
      ...(!isUpdate
        ? {
            standardId: createRelationDeterministicUuid({
              objectId: objectMetadata.id,
              standardId: customStandardFieldId,
            }),
            objectMetadataId: relatedObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            isSystem: true,
            type: FieldMetadataType.RELATION,
            name: objectMetadata.nameSingular,
            label: objectMetadata.labelSingular,
            description,
            icon: 'IconBuildingSkyscraper',
            isNullable: true,
          }
        : {}),
    };
  }

  private buildForeignKeyFieldMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    isUpdate = false,
  ) {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${relatedObjectMetadata.nameSingular}`,
      );
    }

    const { name, label, description } =
      buildNameLabelAndDescriptionForForeignKeyFieldMetadata({
        targetObjectNameSingular: objectMetadata.nameSingular,
        targetObjectLabelSingular: objectMetadata.labelSingular,
        relatedObjectLabelSingular: relatedObjectMetadata.labelSingular,
      });

    return {
      name,
      label,
      description,
      ...(!isUpdate
        ? {
            standardId: createForeignKeyDeterministicUuid({
              objectId: objectMetadata.id,
              standardId: customStandardFieldId,
            }),
            objectMetadataId: relatedObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: objectPrimaryKeyType,
            name,
            label,
            description,
            icon: undefined,
            isNullable: true,
            isSystem: true,
            defaultValue: undefined,
            settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
          }
        : {}),
    };
  }

  private async createRelationMetadataFromFieldMetadatas(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    relationFieldMetadataCollection: FieldMetadataEntity[],
  ) {
    const relationFieldMetadataMap = relationFieldMetadataCollection.reduce(
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

  async updateObjectRelationshipsActivationStatus(
    objectMetadataId: string,
    isActive: boolean,
  ) {
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
}
