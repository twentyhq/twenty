import { Injectable, ValidationError } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, IsUUID, validateOrReject } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
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

type ValidateFieldMetadataArgs<T extends UpdateFieldInput | CreateFieldInput> =
  {
    fieldMetadataType: FieldMetadataType;
    fieldMetadataInput: T;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    existingFieldMetadata?: FieldMetadataInterface;
    objectMetadataMaps: ObjectMetadataMaps;
  };

@Injectable()
export class FieldMetadataRelationService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async createRelationFieldMetadataItems({
    fieldMetadataInput,
    objectMetadata,
    fieldMetadataRepository,
  }: {
    fieldMetadataInput: CreateFieldInput;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    fieldMetadataRepository: Repository<FieldMetadataEntity>;
  }): Promise<FieldMetadataEntity[]> {
    const createdFieldMetadataItem =
      await fieldMetadataRepository.save(fieldMetadataInput);

    const relationCreationPayload = fieldMetadataInput.relationCreationPayload;

    if (!isDefined(relationCreationPayload)) {
      throw new FieldMetadataException(
        'Relation creation payload is not defined',
        FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
      );
    }
    const targetFieldMetadataName = computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel,
    );

    const targetFieldMetadataToCreate = prepareCustomFieldMetadataForCreation({
      objectMetadataId: relationCreationPayload.targetObjectMetadataId,
      type: fieldMetadataInput.type,
      name: targetFieldMetadataName,
      label: relationCreationPayload.targetFieldLabel,
      icon: relationCreationPayload.targetFieldIcon,
      workspaceId: fieldMetadataInput.workspaceId,
    });

    const targetFieldMetadataToCreateWithRelation =
      await this.addCustomRelationFieldMetadataForCreation({
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

    // todo better type
    const targetFieldMetadataToCreateWithRelationWithId = {
      id: v4(),
      ...targetFieldMetadataToCreateWithRelation,
    };

    const targetFieldMetadata = await fieldMetadataRepository.save({
      ...targetFieldMetadataToCreateWithRelationWithId,
      relationTargetFieldMetadataId: createdFieldMetadataItem.id,
    });

    const createdFieldMetadataItemUpdated = await fieldMetadataRepository.save({
      ...createdFieldMetadataItem,
      relationTargetFieldMetadataId: targetFieldMetadata.id,
    });

    return [createdFieldMetadataItemUpdated, targetFieldMetadata];
  }

  async validateFieldMetadataRelationSpecifics<
    T extends UpdateFieldInput | CreateFieldInput,
  >({
    fieldMetadataInput,
    fieldMetadataType,
    objectMetadataMaps,
  }: Pick<
    ValidateFieldMetadataArgs<T>,
    'fieldMetadataInput' | 'fieldMetadataType' | 'objectMetadataMaps'
  >): Promise<T> {
    // TODO: clean typings, we should try to validate both update and create inputs in the same function
    const isRelation =
      fieldMetadataType === FieldMetadataType.RELATION ||
      fieldMetadataType === FieldMetadataType.MORPH_RELATION;

    if (
      isRelation &&
      isDefined(
        (fieldMetadataInput as unknown as CreateFieldInput)
          .relationCreationPayload,
      )
    ) {
      const relationCreationPayload = (
        fieldMetadataInput as unknown as CreateFieldInput
      ).relationCreationPayload;

      if (isDefined(relationCreationPayload)) {
        await this.validateRelationCreationPayloadOrThrow(
          relationCreationPayload,
        );
        const computedMetadataNameFromLabel = computeMetadataNameFromLabel(
          relationCreationPayload.targetFieldLabel,
        );

        validateMetadataNameOrThrow(computedMetadataNameFromLabel);

        const objectMetadataTarget =
          objectMetadataMaps.byId[
            relationCreationPayload.targetObjectMetadataId
          ];

        validateFieldNameAvailabilityOrThrow(
          computedMetadataNameFromLabel,
          objectMetadataTarget,
        );
      }
    }

    return fieldMetadataInput;
  }

  private async validateRelationCreationPayloadOrThrow(
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

  addCustomRelationFieldMetadataForCreation({
    fieldMetadataInput,
    relationCreationPayload,
    objectMetadata,
  }: {
    fieldMetadataInput: CreateFieldInput;
    relationCreationPayload: CreateFieldInput['relationCreationPayload'];
    objectMetadata: ObjectMetadataItemWithFieldMaps;
  }) {
    const isRelation =
      isFieldMetadataInterfaceOfType(
        fieldMetadataInput,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataInterfaceOfType(
        fieldMetadataInput,
        FieldMetadataType.MORPH_RELATION,
      );

    const isManyToOne =
      isRelation && relationCreationPayload?.type === RelationType.MANY_TO_ONE;

    const isOneToMany =
      isRelation && relationCreationPayload?.type === RelationType.ONE_TO_MANY;

    const defaultIcon = 'IconRelationOneToMany';

    const joinColumnName = isFieldMetadataInterfaceOfType(
      fieldMetadataInput,
      FieldMetadataType.MORPH_RELATION,
    )
      ? `${fieldMetadataInput.name}${capitalize(objectMetadata.nameSingular)}Id`
      : `${fieldMetadataInput.name}Id`;

    return {
      ...fieldMetadataInput,
      icon: fieldMetadataInput.icon ?? defaultIcon,
      relationCreationPayload,
      relationTargetObjectMetadataId:
        relationCreationPayload?.targetObjectMetadataId,
      settings: {
        ...fieldMetadataInput.settings,
        ...(isOneToMany
          ? {
              relationType: RelationType.ONE_TO_MANY,
            }
          : {}),
        ...(isManyToOne
          ? {
              relationType: RelationType.MANY_TO_ONE,
              onDelete: RelationOnDeleteAction.SET_NULL,
              joinColumnName,
            }
          : {}),
      },
    };
  }
}
