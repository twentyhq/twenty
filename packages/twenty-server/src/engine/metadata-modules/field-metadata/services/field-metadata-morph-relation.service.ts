import { Injectable } from '@nestjs/common';

import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  capitalize,
  computeMorphRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
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
import { computeRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-relation-field-join-column-name.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class FieldMetadataMorphRelationService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
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

      const relationFieldMetadataForCreate =
        this.fieldMetadataRelationService.computeCustomRelationFieldMetadataForCreation(
          {
            fieldMetadataInput: {
              ...fieldMetadataForCreate,
              name: `${fieldMetadataForCreate.name}${capitalize(targetObjectMetadata.nameSingular)}`,
            },
            relationCreationPayload: relationCreationPayload,
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
    flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
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

    const allMorphFlatFieldMetadatas =
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

    return allMorphFlatFieldMetadatas.map((morphFlatFieldMetadata) => ({
      type: RelationType.MANY_TO_ONE, // does not make sense like that, we cannot know which settings was used to create relation pair
      sourceObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
        sourceFlatObjectMetadata,
      ),
      sourceFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
        morphFlatFieldMetadata,
      ),
      targetObjectMetadata: fromFlatObjectMetadataToObjectMetadataDto(
        morphFlatFieldMetadata.flatRelationTargetObjectMetadata,
      ),
      targetFieldMetadata: fromFlatFieldMetadataToFieldMetadataDto(
        morphFlatFieldMetadata.flatRelationTargetFieldMetadata,
      ),
    }));
  }
}
