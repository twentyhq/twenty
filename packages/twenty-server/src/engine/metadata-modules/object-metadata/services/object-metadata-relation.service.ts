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
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  STANDARD_OBJECT_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
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

  public async createMetadata(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    relatedObjectMetadataName: string,
  ) {
    const relatedObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: relatedObjectMetadataName,
        workspaceId: workspaceId,
      });

    await this.createForeignKeyFieldMetadata(
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
    );

    await this.createRelationMetadata(
      workspaceId,
      createdObjectMetadata,
      relatedObjectMetadata,
      relationFieldMetadata,
    );

    return relatedObjectMetadata;
  }

  private async createForeignKeyFieldMetadata(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${relatedObjectMetadata.nameSingular}`,
      );
    }

    await this.fieldMetadataRepository.save({
      standardId: createForeignKeyDeterministicUuid({
        objectId: createdObjectMetadata.id,
        standardId: customStandardFieldId,
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
  ) {
    return await this.fieldMetadataRepository.save([
      this.createFromField(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
      ),
      this.createToField(
        workspaceId,
        createdObjectMetadata,
        relatedObjectMetadata,
      ),
    ]);
  }

  private createFromField(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
  ) {
    const relationObjectMetadataNamePlural = relatedObjectMetadata.namePlural;

    return {
      standardId:
        CUSTOM_OBJECT_STANDARD_FIELD_IDS[relationObjectMetadataNamePlural],
      objectMetadataId: createdObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      name: relatedObjectMetadata.namePlural,
      label: capitalize(relationObjectMetadataNamePlural),
      description: `${capitalize(relationObjectMetadataNamePlural)} tied to the ${createdObjectMetadata.labelSingular}`,
      icon:
        STANDARD_OBJECT_ICONS[relatedObjectMetadata.nameSingular] ||
        'IconBuildingSkyscraper',
      isNullable: true,
    };
  }

  private createToField(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadata: ObjectMetadataEntity,
  ) {
    const customStandardFieldId =
      STANDARD_OBJECT_FIELD_IDS[relatedObjectMetadata.nameSingular].custom;

    if (!customStandardFieldId) {
      throw new Error(
        `Custom standard field ID not found for ${relatedObjectMetadata.nameSingular}`,
      );
    }

    return {
      standardId: createRelationDeterministicUuid({
        objectId: createdObjectMetadata.id,
        standardId: customStandardFieldId,
      }),
      objectMetadataId: relatedObjectMetadata.id,
      workspaceId: workspaceId,
      isCustom: false,
      isActive: true,
      isSystem: true,
      type: FieldMetadataType.RELATION,
      name: createdObjectMetadata.nameSingular,
      label: createdObjectMetadata.labelSingular,
      description: `${capitalize(relatedObjectMetadata.nameSingular)} ${createdObjectMetadata.labelSingular}`,
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
}
