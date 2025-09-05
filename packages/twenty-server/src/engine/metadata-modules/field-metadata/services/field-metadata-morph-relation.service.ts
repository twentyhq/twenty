import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morh-relation-field-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
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

  async findCachedFieldMetadataMorphRelation({
    flatFieldMetadata,
    workspaceId,
  }: {
    flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>; // I don't receive a real flatFIeldMetadata here there's not relation
    workspaceId: string;
  }): Promise<RelationDTO[]> {
    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeFlatObjectMetadataMaps(
        {
          workspaceId,
        },
      );

    const sourceFlatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
        objectMetadataId: flatFieldMetadata.objectMetadataId,
      });

    const relatedMorphFlatFieldMetadatas =
      findFlatFieldMetadatasRelatedToMorphRelationOrThrow({
        flatFieldMetadata,
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      }).filter(
        (
          flatFieldMetadata,
        ): flatFieldMetadata is FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
          isFlatFieldMetadataOfType(
            flatFieldMetadata,
            FieldMetadataType.MORPH_RELATION,
          ),
      );
    const allMorphFlatFieldMetadatas = [
      flatFieldMetadata,
      ...relatedMorphFlatFieldMetadatas,
    ];

    return allMorphFlatFieldMetadatas.map((morphFlatFieldMetadata) => {
      const targetFlatObjectMetadataWithFlatFieldMaps =
        existingFlatObjectMetadataMaps.byId[
          morphFlatFieldMetadata.relationTargetObjectMetadataId
        ];

      // TODO prastoin check if we can send relationTarget flat field metadata
      if (!isDefined(targetFlatObjectMetadataWithFlatFieldMaps)) {
        throw new FlatObjectMetadataMapsException(
          'Morph relation dataloader could not find related object metadata in cache',
          FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const targetFlatFieldMetadata =
        targetFlatObjectMetadataWithFlatFieldMaps.fieldsById[
          morphFlatFieldMetadata.relationTargetFieldMetadataId
        ];

      if (!isDefined(targetFlatFieldMetadata)) {
        throw new FlatObjectMetadataMapsException(
          'Morph relation dataloader could not find related object metadata in cache',
          FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const targetFlatObjecMetadata =
        fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
          targetFlatObjectMetadataWithFlatFieldMaps,
        );

      return {
        type: flatFieldMetadata.settings.relationType,
        sourceObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
          sourceFlatObjectMetadata,
        ),
        sourceFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
          morphFlatFieldMetadata,
        ),
        targetObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
          targetFlatObjecMetadata,
        ),
        targetFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
          targetFlatFieldMetadata,
        ),
      };
    });
  }
}
