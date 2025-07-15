import { Injectable, ValidationError } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, IsUUID, validateOrReject } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataFromObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/utils/get-object-metadata-from-object-metadata-Item-with-field-maps';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

type FieldMetadataEntityRelationSettings = Pick<
  FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
  'settings' | 'icon' | 'relationTargetObjectMetadataId'
>;

export class RelationCreationPayloadValidation {
  @IsUUID()
  targetObjectMetadataId?: string;

  @IsString()
  targetFieldLabel: string;

  @IsString()
  targetFieldIcon: string;

  @IsEnum(RelationType)
  type: RelationType;
}
@Injectable()
export class FieldMetadataRelationService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  // What happens here if it's the same object ?
  async createRelationFieldMetadataItems({
    fieldMetadataInput,
    objectMetadata,
    fieldMetadataRepository,
    relationCreationPayload,
  }: {
    fieldMetadataInput: CreateFieldInput;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    fieldMetadataRepository: Repository<FieldMetadataEntity>;
    relationCreationPayload: NonNullable<
      CreateFieldInput['relationCreationPayload']
    >;
  }): Promise<FieldMetadataEntity[]> {
    const createdFieldMetadataItem =
      await fieldMetadataRepository.save(fieldMetadataInput);
    const targetFieldMetadataName = computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel, // Should be sanitized at least
    );

    validateFieldNameAvailabilityOrThrow({
      name: targetFieldMetadataName,
      objectMetadata,
    });

    const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation({
      objectMetadataId: relationCreationPayload.targetObjectMetadataId,
      type: fieldMetadataInput.type,
      name: targetFieldMetadataName,
      label: relationCreationPayload.targetFieldLabel,
      icon: relationCreationPayload.targetFieldIcon,
      workspaceId: fieldMetadataInput.workspaceId,
    });

    const targetFieldMetadataRelationSettings =
      this.computeRelationSettingsIconAndRelationTargetObjectMetadataId({
        fieldMetadataInput: targetFieldMetadataToCreate,
        relationCreationPayload: {
          targetObjectMetadataId: objectMetadata.id,
          targetFieldLabel: fieldMetadataInput.label,
          targetFieldIcon: fieldMetadataInput.icon ?? 'Icon123',
          type:
            relationCreationPayload.type === RelationType.ONE_TO_MANY
              ? RelationType.MANY_TO_ONE
              : RelationType.ONE_TO_MANY,
        },
        objectMetadata,
      });

    const targetFieldMetadata = await fieldMetadataRepository.save({
      // id: v4(), // useless ?
      ...targetFieldMetadataRelationSettings,
      relationTargetFieldMetadataId: createdFieldMetadataItem.id,
    });

    const createdFieldMetadataItemUpdated = await fieldMetadataRepository.save({
      ...createdFieldMetadataItem,
      relationTargetFieldMetadataId: targetFieldMetadata.id,
    });

    return [createdFieldMetadataItemUpdated, targetFieldMetadata];
  }

  async computeTargetStuff({
    fieldMetadataInput,
    targetObjectMetadata,
    sourceObjectMetadata,
    relationCreationPayload,
  }: {
    fieldMetadataInput: CreateFieldInput;
    sourceObjectMetadata: ObjectMetadataItemWithFieldMaps;
    targetObjectMetadata: ObjectMetadataItemWithFieldMaps;
    relationCreationPayload: NonNullable<
      CreateFieldInput['relationCreationPayload']
    >;
  }): Promise<FieldMetadataEntity[]> {
    const targetFieldMetadataName = computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel, // Should be sanitized at least
    );

    const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation({
      objectMetadataId: relationCreationPayload.targetObjectMetadataId,
      type: fieldMetadataInput.type,
      name: targetFieldMetadataName,
      label: relationCreationPayload.targetFieldLabel,
      icon: relationCreationPayload.targetFieldIcon,
      workspaceId: fieldMetadataInput.workspaceId,
    });

    const targetFieldMetadataRelationSettings =
      this.computeRelationSettingsIconAndRelationTargetObjectMetadataId({
        fieldMetadataInput: targetFieldMetadataToCreate,
        relationCreationPayload: {
          targetObjectMetadataId: sourceObjectMetadata.id,
          targetFieldLabel: fieldMetadataInput.label,
          targetFieldIcon: fieldMetadataInput.icon ?? 'Icon123',
          type:
            relationCreationPayload.type === RelationType.ONE_TO_MANY
              ? RelationType.MANY_TO_ONE
              : RelationType.ONE_TO_MANY,
        },
        objectMetadata: targetObjectMetadata,
      });

    return targetFieldMetadataRelationSettings;
  }

  async validateFieldMetadataRelationCreationPayloadOrThrow({
    fieldMetadataInput,
    objectMetadataMaps,
  }: {
    fieldMetadataInput: CreateFieldInput;
    objectMetadataMaps: ObjectMetadataMaps;
  }): Promise<NonNullable<CreateFieldInput['relationCreationPayload']>>{
    if (!isDefined(fieldMetadataInput.relationCreationPayload)) {
      throw new Error(
        'TODO, relation creation payload is required for creation',
      );
    }

    const { relationCreationPayload } = fieldMetadataInput;

    await this.convertInputToClassValidatorRelationCreationPayload(relationCreationPayload);
    const computedMetadataNameFromLabel = computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel,
    );

    validateMetadataNameOrThrow(computedMetadataNameFromLabel);

    const objectMetadataTarget =
      objectMetadataMaps.byId[relationCreationPayload.targetObjectMetadataId];

    if (!isDefined(objectMetadataTarget)) {
      throw new FieldMetadataException(
        `Object metadata relation target not found for relation creation payload`,
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }

    validateFieldNameAvailabilityOrThrow({
      name: computedMetadataNameFromLabel,
      objectMetadata: objectMetadataTarget,
    });

    return fieldMetadataInput.relationCreationPayload
  }

  private async convertInputToClassValidatorRelationCreationPayload(
    relationCreationPayload: RelationCreationPayloadValidation,
  ) {
    try {
      const relationCreationPayloadInstance = plainToInstance(
        RelationCreationPayloadValidation,
        relationCreationPayload,
      );

      await validateOrReject(relationCreationPayloadInstance);
    } catch (error) {
      const errorMessages = Array.isArray(error)
        ? error
            .map((err: ValidationError) => Object.values(err.constraints ?? {}))
            .flat()
            .join(', ')
        : error.message;

      throw new FieldMetadataException(
        `Relation creation payload is invalid: ${errorMessages}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  async findCachedFieldMetadataRelation(
    fieldMetadataItems: Array<
      Pick<
        FieldMetadataInterface,
        | 'id'
        | 'type'
        | 'objectMetadataId'
        | 'relationTargetFieldMetadataId'
        | 'relationTargetObjectMetadataId'
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

    return fieldMetadataItems.map((fieldMetadataItem) => {
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

  // Hell to type due to nestJs OmitType that prevents passing a generic type here
  computeRelationSettingsIconAndRelationTargetObjectMetadataId({
    fieldMetadataInput,
    relationCreationPayload,
    objectMetadata,
  }: {
    fieldMetadataInput: CreateFieldInput;
    relationCreationPayload: NonNullable<CreateFieldInput['relationCreationPayload']>;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
  }): FieldMetadataEntityRelationSettings {
    const defaultIcon = 'IconRelationOneToMany';

    if (relationCreationPayload.type === RelationType.MANY_TO_ONE) {
      return {
        icon: fieldMetadataInput.icon ?? defaultIcon,
        relationTargetObjectMetadataId:
          relationCreationPayload?.targetObjectMetadataId,
        settings: {
          ...fieldMetadataInput.settings,
          relationType: RelationType.ONE_TO_MANY,
        },
      };
    }

    const joinColumnName = isFieldMetadataInterfaceOfType(
      fieldMetadataInput,
      FieldMetadataType.MORPH_RELATION,
    )
      ? `${fieldMetadataInput.name}${capitalize(objectMetadata.nameSingular)}Id`
      : `${fieldMetadataInput.name}Id`;

    // Should never occur as always adding Id
    validateFieldNameAvailabilityOrThrow({
      name: joinColumnName,
      objectMetadata,
    });

    return {
      icon: fieldMetadataInput.icon ?? defaultIcon,
      relationTargetObjectMetadataId:
        relationCreationPayload?.targetObjectMetadataId,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName,
      },
    };
  }
}
