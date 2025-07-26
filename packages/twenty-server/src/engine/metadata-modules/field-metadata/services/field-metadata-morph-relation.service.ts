import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { computeMorphRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-field-join-column-name.util';
import { computeRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-relation-field-join-column-name.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataFromObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/utils/get-object-metadata-from-object-metadata-Item-with-field-maps';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class FieldMetadataMorphRelationService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async createMorphRelationFieldMetadataItems({
    fieldMetadataForCreate,
    morphRelationsCreationPayload,
    objectMetadata,
    fieldMetadataRepository,
    objectMetadataMaps,
  }: {
    fieldMetadataForCreate: CreateFieldInput;
    morphRelationsCreationPayload: CreateFieldInput['morphRelationsCreationPayload'];
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    fieldMetadataRepository: Repository<FieldMetadataEntity>;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<FieldMetadataEntity[]> {
    if (
      !isDefined(morphRelationsCreationPayload) ||
      !Array.isArray(morphRelationsCreationPayload)
    ) {
      throw new FieldMetadataException(
        'Morph relations creation payload is not defined',
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    if (morphRelationsCreationPayload.length < 1) {
      throw new FieldMetadataException(
        'Morph relations creation payload must not be empty',
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    const fieldsCreated: FieldMetadataEntity[] = [];

    for (const relation of morphRelationsCreationPayload) {
      const targetObjectMetadata =
        objectMetadataMaps.byId[relation.targetObjectMetadataId];

      if (!isDefined(targetObjectMetadata)) {
        throw new FieldMetadataException(
          'Target object metadata does not exist in the object metadata maps',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const relationFieldMetadataForCreate =
        this.fieldMetadataRelationService.computeCustomRelationFieldMetadataForCreation(
          {
            fieldMetadataInput: fieldMetadataForCreate,
            relationCreationPayload: relation,
            joinColumnName: computeMorphRelationFieldJoinColumnName({
              name: fieldMetadataForCreate.name,
              targetObjectMetadataNameSingular:
                targetObjectMetadata.nameSingular,
            }),
          },
        );

      await this.fieldMetadataRelationService.validateFieldMetadataRelationSpecifics(
        {
          fieldMetadataInput: relationFieldMetadataForCreate,
          fieldMetadataType: relationFieldMetadataForCreate.type,
          objectMetadataMaps,
          objectMetadata,
        },
      );

      const createdFieldMetadataItem = await fieldMetadataRepository.save(
        omit(relationFieldMetadataForCreate, 'id'),
      );

      const targetFieldMetadataName = computeMetadataNameFromLabel(
        relation.targetFieldLabel,
      );

      const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation(
        {
          objectMetadataId: relation.targetObjectMetadataId,
          type: FieldMetadataType.RELATION,
          name: targetFieldMetadataName,
          label: relation.targetFieldLabel,
          icon: relation.targetFieldIcon,
          workspaceId: fieldMetadataForCreate.workspaceId,
          settings: fieldMetadataForCreate.settings,
        },
      );

      const targetFieldMetadataToCreateWithRelation =
        this.fieldMetadataRelationService.computeCustomRelationFieldMetadataForCreation(
          {
            fieldMetadataInput: targetFieldMetadataToCreate,
            relationCreationPayload: {
              targetObjectMetadataId: objectMetadata.id,
              targetFieldLabel: fieldMetadataForCreate.label,
              targetFieldIcon: fieldMetadataForCreate.icon ?? 'Icon123',
              type:
                relation.type === RelationType.ONE_TO_MANY
                  ? RelationType.MANY_TO_ONE
                  : RelationType.ONE_TO_MANY,
            },
            joinColumnName: computeRelationFieldJoinColumnName({
              name: targetFieldMetadataToCreate.name,
            }),
          },
        );

      // todo better type
      const targetFieldMetadataToCreateWithRelationWithId = {
        id: v4(),
        ...targetFieldMetadataToCreateWithRelation,
      };

      const targetFieldMetadata = await fieldMetadataRepository.save({
        ...targetFieldMetadataToCreateWithRelationWithId,
        relationTargetFieldMetadataId: createdFieldMetadataItem.id,
      });

      const createdFieldMetadataItemUpdated =
        await fieldMetadataRepository.save({
          ...createdFieldMetadataItem,
          relationTargetFieldMetadataId: targetFieldMetadata.id,
        });

      fieldsCreated.push(createdFieldMetadataItemUpdated, targetFieldMetadata);
    }

    return fieldsCreated;
  }

  async findCachedFieldMetadataMorphRelation(
    fieldMetadataItems: Array<
      Pick<
        FieldMetadataEntity,
        | 'id'
        | 'type'
        | 'objectMetadataId'
        | 'relationTargetFieldMetadataId'
        | 'relationTargetObjectMetadataId'
        | 'name'
      >
    >,
    workspaceId: string,
  ): Promise<
    Array<{
      sourceObjectMetadata: ObjectMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
      targetObjectMetadata: ObjectMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
    }>
  > {
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

    const fieldMetadataItemsAndMorphSiblings: Pick<
      FieldMetadataEntity,
      | 'id'
      | 'type'
      | 'objectMetadataId'
      | 'relationTargetFieldMetadataId'
      | 'relationTargetObjectMetadataId'
      | 'name'
    >[] = fieldMetadataItems.flatMap((fieldMetadataItem) => {
      const fieldsById =
        objectMetadataMaps.byId[fieldMetadataItem.objectMetadataId]?.fieldsById;

      if (!isDefined(fieldsById)) {
        throw new FieldMetadataException(
          `Fields by id not found for object metadata ${fieldMetadataItem.objectMetadataId}`,
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        );
      }

      return Object.values(fieldsById)
        .filter(
          (fieldMetadataById) =>
            fieldMetadataItem.name === fieldMetadataById.name,
        )
        .map((fieldMetadataById) => {
          return {
            id: fieldMetadataById.id,
            type: fieldMetadataById.type,
            objectMetadataId: fieldMetadataById.objectMetadataId,
            relationTargetFieldMetadataId:
              fieldMetadataById.relationTargetFieldMetadataId,
            relationTargetObjectMetadataId:
              fieldMetadataById.relationTargetObjectMetadataId,
            name: fieldMetadataById.name,
          };
        });
    });

    return fieldMetadataItemsAndMorphSiblings.map((fieldMetadataItem) => {
      const {
        id,
        objectMetadataId,
        relationTargetFieldMetadataId,
        relationTargetObjectMetadataId,
      } = fieldMetadataItem;

      if (!relationTargetObjectMetadataId || !relationTargetFieldMetadataId) {
        throw new FieldMetadataException(
          `Relation target object metadata id or relation target field metadata id not found for field metadata ${id}`,
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        );
      }

      const sourceObjectMetadata = objectMetadataMaps.byId[objectMetadataId];
      const targetObjectMetadata =
        objectMetadataMaps.byId[relationTargetObjectMetadataId];
      const sourceFieldMetadata = sourceObjectMetadata?.fieldsById[id];
      const targetFieldMetadata =
        targetObjectMetadata?.fieldsById[relationTargetFieldMetadataId];

      if (
        !sourceObjectMetadata ||
        !targetObjectMetadata ||
        !sourceFieldMetadata ||
        !targetFieldMetadata
      ) {
        throw new FieldMetadataException(
          `Field relation metadata not found for field metadata ${id}`,
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        );
      }

      return {
        sourceObjectMetadata:
          getObjectMetadataFromObjectMetadataItemWithFieldMaps(
            sourceObjectMetadata,
          ) as ObjectMetadataEntity,
        sourceFieldMetadata: sourceFieldMetadata as FieldMetadataEntity,
        targetObjectMetadata:
          getObjectMetadataFromObjectMetadataItemWithFieldMaps(
            targetObjectMetadata,
          ) as ObjectMetadataEntity,
        targetFieldMetadata: targetFieldMetadata as FieldMetadataEntity,
      };
    });
  }
}
