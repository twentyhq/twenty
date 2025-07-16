import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

@Injectable()
export class FieldMetadataMorphRelationService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
  ) {}

  async createMorphRelationFieldMetadataItems({
    fieldMetadataForCreate,
    morphRelationsCreationPayload,
    objectMetadata,
    fieldMetadataRepository,
    objectMetadataMaps,
  }: {
    fieldMetadataForCreate: CreateFieldInput; // That's not accurate typing invalid
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

    for (const relationCreationPayload of morphRelationsCreationPayload) {
      await this.fieldMetadataRelationService.validateFieldMetadataRelationCreationPayloadOrThrow(
        {
          relationCreationPayload,
          objectMetadataMaps,
        },
      );

      const sourceRelationSettings =
        this.fieldMetadataRelationService.computeRelationSettingsIconAndRelationTargetObjectMetadataId(
          {
            fieldMetadataInput: fieldMetadataForCreate,
            relationCreationPayload: relationCreationPayload,
            objectMetadata,
          },
        );

      // Why omitting id here exactly ?
      const createdFieldMetadataItem = await fieldMetadataRepository.save(
        omit(
          {
            ...fieldMetadataForCreate,
            ...sourceRelationSettings,
          },
          'id',
        ),
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

      const targetRelationSettings =
        this.fieldMetadataRelationService.computeRelationSettingsIconAndRelationTargetObjectMetadataId(
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
            objectMetadata,
          },
        );

      // Should we omit the id here too ?
      const targetFieldMetadata = await fieldMetadataRepository.save({
        // id: v4(), // not needed ?
        ...targetFieldMetadataToCreate,
        ...targetRelationSettings,
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
}
