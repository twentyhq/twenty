import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morh-relation-field-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

@Injectable()
export class FieldMetadataMorphRelationService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
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
    const morphId = v4();

    for (const relationCreationPayload of morphRelationsCreationPayload) {
      const targetObjectMetadata =
        objectMetadataMaps.byId[relationCreationPayload.targetObjectMetadataId];

      if (!isDefined(targetObjectMetadata)) {
        throw new FieldMetadataException(
          'Target object metadata does not exist in the object metadata maps',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const currentMorphRelationFieldName = computeMorphRelationFieldName({
        fieldName: fieldMetadataForCreate.name,
        relationType: relationCreationPayload.type,
        targetObjectMetadata,
      });
      const relationFieldMetadataForCreate =
        this.fieldMetadataRelationService.computeCustomRelationFieldMetadataForCreation(
          {
            fieldMetadataInput: {
              ...fieldMetadataForCreate,
              name: currentMorphRelationFieldName,
            },
            relationCreationPayload: relationCreationPayload,
            joinColumnName: computeMorphOrRelationFieldJoinColumnName({
              name: currentMorphRelationFieldName,
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

      const createdMorphFieldMetadataItemWithoutTargetField =
        await fieldMetadataRepository.save(
          omit({ ...relationFieldMetadataForCreate, morphId }, 'id'),
        );

      const targetFieldMetadataName = computeMetadataNameFromLabel(
        relationCreationPayload.targetFieldLabel,
      );

      const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation(
        {
          objectMetadataId: relationCreationPayload.targetObjectMetadataId,
          type: FieldMetadataType.RELATION,
          name: targetFieldMetadataName,
          label: relationCreationPayload.targetFieldLabel,
          icon: relationCreationPayload.targetFieldIcon,
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
                relationCreationPayload.type === RelationType.ONE_TO_MANY
                  ? RelationType.MANY_TO_ONE
                  : RelationType.ONE_TO_MANY,
            },
            joinColumnName: computeMorphOrRelationFieldJoinColumnName({
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
        relationTargetFieldMetadataId:
          createdMorphFieldMetadataItemWithoutTargetField.id,
      });

      const createdFieldMetadataItemUpdated =
        await fieldMetadataRepository.save({
          ...createdMorphFieldMetadataItemWithoutTargetField,
          relationTargetFieldMetadataId: targetFieldMetadata.id,
        });

      fieldsCreated.push(createdFieldMetadataItemUpdated, targetFieldMetadata);
    }

    return fieldsCreated;
  }
}
