import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type QueryRunner, Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { type FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import {
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  STANDARD_OBJECT_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { createRelationDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

export const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  STANDARD_OBJECT_IDS.timelineActivity,
  STANDARD_OBJECT_IDS.favorite,
  STANDARD_OBJECT_IDS.attachment,
  STANDARD_OBJECT_IDS.noteTarget,
  STANDARD_OBJECT_IDS.taskTarget,
];

type PartialRelationFieldMetadata = Partial<
  FieldMetadataEntity<FieldMetadataType.RELATION>
> &
  Required<Pick<FieldMetadataEntity<FieldMetadataType.RELATION>, 'name'>>;

@Injectable()
export class ObjectMetadataFieldRelationService {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  public async createRelationsAndForeignKeysMetadata(
    workspaceId: string,
    sourceObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'id' | 'nameSingular' | 'labelSingular' | 'fieldsById'
    >,
    objectMetadataMaps: ObjectMetadataMaps,
    queryRunner?: QueryRunner,
  ) {
    const relatedObjectMetadataCollection = await Promise.all(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
        async (relationObjectMetadataStandardId) =>
          this.createRelationAndForeignKeyMetadata({
            workspaceId,
            sourceObjectMetadata,
            relationObjectMetadataStandardId,
            objectMetadataMaps,
            queryRunner,
          }),
      ),
    );

    return relatedObjectMetadataCollection;
  }

  private async createRelationAndForeignKeyMetadata({
    workspaceId,
    sourceObjectMetadata,
    relationObjectMetadataStandardId,
    objectMetadataMaps,
    queryRunner,
  }: {
    workspaceId: string;
    sourceObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'id' | 'nameSingular' | 'labelSingular' | 'fieldsById'
    >;

    objectMetadataMaps: ObjectMetadataMaps;
    relationObjectMetadataStandardId: string;
    queryRunner?: QueryRunner;
  }) {
    const targetObjectMetadata = Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .find(
        (objectMetadata) =>
          objectMetadata.standardId === relationObjectMetadataStandardId,
      );

    if (!targetObjectMetadata) {
      throw new Error(
        `Target object metadata not found for standard ID: ${relationObjectMetadataStandardId}`,
      );
    }

    await this.createFieldMetadataRelation(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
      queryRunner,
    );

    return targetObjectMetadata;
  }

  private async createFieldMetadataRelation(
    workspaceId: string,
    sourceObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'id' | 'nameSingular' | 'labelSingular' | 'fieldsById'
    >,
    targetObjectMetadata: ObjectMetadataItemWithFieldMaps,
    queryRunner?: QueryRunner,
  ): Promise<FieldMetadataEntity<FieldMetadataType.RELATION>[]> {
    const sourceFieldMetadata = this.createSourceFieldMetadata(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    this.validateFieldNameAvailabilityOrThrow({
      name: sourceFieldMetadata.name,
      fieldMetadataMapById: sourceObjectMetadata.fieldsById,
    });

    const targetFieldMetadata = this.createTargetFieldMetadata(
      workspaceId,
      sourceObjectMetadata,
      targetObjectMetadata,
    );

    this.validateFieldNameAvailabilityOrThrow({
      name: targetFieldMetadata.name,
      fieldMetadataMapById: sourceObjectMetadata.fieldsById,
    });

    const fieldMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(FieldMetadataEntity)
      : this.fieldMetadataRepository;

    return fieldMetadataRepository.save([
      {
        ...sourceFieldMetadata,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
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

  public async updateRelationsAndForeignKeysMetadata({
    workspaceId,
    updatedObjectMetadata,
    objectMetadataMaps,
    queryRunner,
  }: {
    workspaceId: string;
    updatedObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom' | 'id' | 'labelSingular'
    >;
    objectMetadataMaps: ObjectMetadataMaps;
    queryRunner?: QueryRunner;
  }): Promise<
    {
      targetObjectMetadata: ObjectMetadataItemWithFieldMaps;
      targetFieldMetadata: FieldMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
    }[]
  > {
    return await Promise.all(
      DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
        async (relationObjectMetadataStandardId) =>
          this.updateRelationAndForeignKeyMetadata({
            workspaceId,
            sourceObjectMetadata: updatedObjectMetadata,
            targetObjectMetadataStandardId: relationObjectMetadataStandardId,
            objectMetadataMaps,
            queryRunner,
          }),
      ),
    );
  }

  private async updateRelationAndForeignKeyMetadata({
    workspaceId,
    sourceObjectMetadata,
    targetObjectMetadataStandardId,
    objectMetadataMaps,
    queryRunner,
  }: {
    workspaceId: string;
    sourceObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'id' | 'isCustom' | 'labelSingular'
    >;
    targetObjectMetadataStandardId: string;
    objectMetadataMaps: ObjectMetadataMaps;
    queryRunner?: QueryRunner;
  }): Promise<{
    targetObjectMetadata: ObjectMetadataItemWithFieldMaps;
    targetFieldMetadata: FieldMetadataEntity;
    sourceFieldMetadata: FieldMetadataEntity;
  }> {
    const fieldMetadataRepository = queryRunner
      ? queryRunner.manager.getRepository(FieldMetadataEntity)
      : this.fieldMetadataRepository;

    const targetObjectMetadataId = Object.values(objectMetadataMaps.byId).find(
      (objectMetadata) =>
        objectMetadata?.standardId === targetObjectMetadataStandardId &&
        objectMetadata.isCustom === false,
    )?.id;

    if (!targetObjectMetadataId) {
      throw new Error(
        `Target object metadata id not found for standard ID: ${targetObjectMetadataStandardId}`,
      );
    }

    const targetObjectMetadata =
      objectMetadataMaps.byId[targetObjectMetadataId];

    if (!targetObjectMetadata) {
      throw new Error(
        `Target object metadata not found for id: ${targetObjectMetadataId}`,
      );
    }

    const targetFieldMetadataUpdateData = this.updateTargetFieldMetadata(
      sourceObjectMetadata,
      targetObjectMetadata,
    );
    const targetFieldMetadataToUpdate =
      await fieldMetadataRepository.findOneByOrFail({
        standardId: createRelationDeterministicUuid({
          objectId: sourceObjectMetadata.id,
          standardId:
            // @ts-expect-error legacy noImplicitAny
            STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom,
        }),
        objectMetadataId: targetObjectMetadata.id,
        workspaceId: workspaceId,
      });

    const nameIsUpdated =
      targetFieldMetadataUpdateData.name !== targetFieldMetadataToUpdate.name;

    if (nameIsUpdated) {
      const targetObjectMetadataFieldsById =
        objectMetadataMaps.byId[targetObjectMetadata.id]?.fieldsById;

      if (!targetObjectMetadataFieldsById) {
        throw new Error(
          `Target object metadata fields not found for ${targetObjectMetadata.id}`,
        );
      }

      this.validateFieldNameAvailabilityOrThrow({
        name: targetFieldMetadataUpdateData.name,
        fieldMetadataMapById: targetObjectMetadataFieldsById,
      });
    }

    const isTargetFieldMetadataManyToOneRelation =
      (
        targetFieldMetadataToUpdate as FieldMetadataEntity<FieldMetadataType.RELATION>
      ).settings?.relationType === RelationType.MANY_TO_ONE;

    const targetFieldMetadata = await fieldMetadataRepository.save({
      id: targetFieldMetadataToUpdate.id,
      ...targetFieldMetadataUpdateData,
      settings: {
        ...targetFieldMetadataToUpdate.settings,
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
      await fieldMetadataRepository.findOneByOrFail({
        standardId:
          // @ts-expect-error legacy noImplicitAny
          CUSTOM_OBJECT_STANDARD_FIELD_IDS[targetObjectMetadata.namePlural],
        objectMetadataId: sourceObjectMetadata.id,
        workspaceId: workspaceId,
      });

    const isSourceFieldMetadataManyToOneRelation =
      (
        sourceFieldMetadataToUpdate as FieldMetadataEntity<FieldMetadataType.RELATION>
      ).settings?.relationType === RelationType.MANY_TO_ONE;

    const sourceFieldMetadata = await fieldMetadataRepository.save({
      id: sourceFieldMetadataToUpdate.id,
      ...sourceFieldMetadataUpdateData,
      settings: {
        ...sourceFieldMetadataToUpdate.settings,
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
    sourceObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'labelSingular' | 'id'
    >,
    targetObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'namePlural' | 'labelSingular'
    >,
  ): PartialRelationFieldMetadata {
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
        // @ts-expect-error legacy noImplicitAny
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
        // @ts-expect-error legacy noImplicitAny
        STANDARD_OBJECT_ICONS[targetObjectMetadata.nameSingular] ||
        'IconBuildingSkyscraper',
      isNullable: true,
    };
  }

  private updateSourceFieldMetadata(
    sourceObjectMetadata: Pick<ObjectMetadataEntity, 'labelSingular'>,
    targetObjectMetadata: Pick<ObjectMetadataEntity, 'namePlural'>,
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
    sourceObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'labelSingular' | 'id' | 'nameSingular'
    >,
    targetObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'namePlural' | 'labelSingular' | 'id' | 'nameSingular'
    >,
  ): PartialRelationFieldMetadata {
    const customStandardFieldId =
      // @ts-expect-error legacy noImplicitAny
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
    sourceObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'labelSingular'
    >,
    targetObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'namePlural'
    >,
  ) {
    const customStandardFieldId =
      // @ts-expect-error legacy noImplicitAny
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

  private validateFieldMetadataTypeIsMorphRelation = (
    fieldMetadatas: FieldMetadataEntity[],
  ): fieldMetadatas is Array<
    FieldMetadataEntity & FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>
  > => {
    return fieldMetadatas.every(
      (fieldMetadata) =>
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION,
    );
  };

  public async findTargetMorphRelationFieldMetadatas(
    objectMetadataId: string,
  ): Promise<FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>[]> {
    const fieldMetadatas = await this.fieldMetadataRepository.find({
      where: {
        relationTargetObjectMetadataId: objectMetadataId,
        type: FieldMetadataType.MORPH_RELATION,
      },
      relations: {
        relationTargetObjectMetadata: true,
        object: true,
      },
    });

    if (!this.validateFieldMetadataTypeIsMorphRelation(fieldMetadatas)) {
      throw new ObjectMetadataException(
        'Invalid field metadata type. Expected MORPH_RELATION only',
        ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT,
      );
    }

    return fieldMetadatas;
  }

  // Not maintained on v1, this side effect is broken and will duplicated field name references on
  // object update
  // It's functional on v2
  public async updateMorphRelationsJoinColumnName({
    existingObjectMetadata,
    objectMetadataForUpdate: _,
    queryRunner,
  }: {
    existingObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'nameSingular' | 'isCustom' | 'id' | 'labelPlural' | 'icon' | 'fieldsById'
    >;
    objectMetadataForUpdate: Pick<
      ObjectMetadataItemWithFieldMaps,
      | 'nameSingular'
      | 'isCustom'
      | 'workspaceId'
      | 'id'
      | 'labelSingular'
      | 'labelPlural'
      | 'icon'
      | 'fieldsById'
    >;
    queryRunner: QueryRunner;
  }): Promise<
    {
      fieldMetadata: FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;
      newJoinColumnName: string;
    }[]
  > {
    const fieldMetadataRepository =
      queryRunner.manager.getRepository(FieldMetadataEntity);

    const morphRelationFieldMetadataTargets =
      await this.findTargetMorphRelationFieldMetadatas(
        existingObjectMetadata.id,
      );
    const morphRelationFieldMetadataToUpdate =
      morphRelationFieldMetadataTargets.filter(
        (morphRelationFieldMetadata) =>
          morphRelationFieldMetadata.settings?.relationType ===
          RelationType.MANY_TO_ONE,
      );

    const morphRelationFieldMetadataToUpdateWithNewJoinColumnName = [];

    if (morphRelationFieldMetadataToUpdate.length > 0) {
      for (const morphRelationFieldMetadata of morphRelationFieldMetadataToUpdate) {
        const newJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: morphRelationFieldMetadata.name,
        });

        await fieldMetadataRepository.save({
          ...morphRelationFieldMetadata,
          settings: {
            ...morphRelationFieldMetadata.settings,
            joinColumnName: newJoinColumnName,
          },
        });

        morphRelationFieldMetadataToUpdateWithNewJoinColumnName.push({
          fieldMetadata: morphRelationFieldMetadata,
          newJoinColumnName,
        });
      }
    }

    return morphRelationFieldMetadataToUpdateWithNewJoinColumnName;
  }

  private validateFieldNameAvailabilityOrThrow({
    name,
    fieldMetadataMapById,
  }: {
    name: string;
    fieldMetadataMapById: FieldMetadataMap;
  }) {
    try {
      validateFieldNameAvailabilityOrThrow({
        name,
        fieldMetadataMapById,
      });
    } catch (error) {
      if (error instanceof InvalidMetadataException) {
        throw new ObjectMetadataException(
          `Name "${name}" is not available.`,
          ObjectMetadataExceptionCode.NAME_CONFLICT,
          {
            userFriendlyMessage: msg`Name "${name}" is not available.`,
          },
        );
      }
      throw error;
    }
  }
}
