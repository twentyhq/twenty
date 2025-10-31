import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import {
  type FieldMetadataSettings,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload-or-throw.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-or-throw.utils';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
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
    existingFieldMetadata?: FieldMetadataEntity;
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
      defaultValue: fieldMetadataInput.defaultValue,
    });

    const targetFieldMetadataToCreateWithRelation =
      this.computeCustomRelationFieldMetadataForCreation({
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
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: targetFieldMetadataToCreate.name,
        }),
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
    objectMetadata,
  }: Pick<
    ValidateFieldMetadataArgs<T>,
    | 'fieldMetadataInput'
    | 'fieldMetadataType'
    | 'objectMetadataMaps'
    | 'objectMetadata'
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
      validateFieldNameAvailabilityOrThrow({
        name: `${fieldMetadataInput.name}Id`,
        fieldMetadataMapById: objectMetadata.fieldsById,
      });

      const relationCreationPayload = (
        fieldMetadataInput as unknown as CreateFieldInput
      ).relationCreationPayload;

      if (isDefined(relationCreationPayload)) {
        await validateRelationCreationPayloadOrThrow(relationCreationPayload);
        const computedMetadataNameFromLabel = computeMetadataNameFromLabel(
          relationCreationPayload.targetFieldLabel,
        );

        validateMetadataNameOrThrow(computedMetadataNameFromLabel);

        const objectMetadataTarget =
          objectMetadataMaps.byId[
            relationCreationPayload.targetObjectMetadataId
          ];

        if (!isDefined(objectMetadataTarget)) {
          throw new FieldMetadataException(
            `Object metadata relation target not found for relation creation payload`,
            FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          );
        }

        validateFieldNameAvailabilityOrThrow({
          name: computedMetadataNameFromLabel,
          fieldMetadataMapById: objectMetadataTarget.fieldsById,
        });

        validateFieldNameAvailabilityOrThrow({
          name: `${computedMetadataNameFromLabel}Id`,
          fieldMetadataMapById: objectMetadataTarget.fieldsById,
        });

        if (
          computedMetadataNameFromLabel === fieldMetadataInput.name &&
          objectMetadata.id === objectMetadataTarget.id
        ) {
          throw new FieldMetadataException(
            `Name "${computedMetadataNameFromLabel}" cannot be the same on both side of the relation`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            {
              userFriendlyMessage: msg`Name "${computedMetadataNameFromLabel}" cannot be the same on both side of the relation`,
            },
          );
        }
      }
    }

    return fieldMetadataInput;
  }

  // TODO refactor and strictly type
  computeCustomRelationFieldMetadataForCreation({
    fieldMetadataInput,
    relationCreationPayload,
    joinColumnName,
  }: {
    fieldMetadataInput: CreateFieldInput;
    relationCreationPayload: CreateFieldInput['relationCreationPayload'];
    joinColumnName: string;
  }) {
    const isRelation =
      isFieldMetadataEntityOfType(
        fieldMetadataInput,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataEntityOfType(
        fieldMetadataInput,
        FieldMetadataType.MORPH_RELATION,
      );

    const defaultIcon = 'IconRelationOneToMany';

    const isManyToOne =
      isRelation && relationCreationPayload?.type === RelationType.MANY_TO_ONE;

    const settings = isManyToOne
      ? {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.SET_NULL,
          joinColumnName,
        }
      : {
          ...(fieldMetadataInput.settings as FieldMetadataSettings<
            FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
          >),
          relationType: RelationType.ONE_TO_MANY,
        };

    return {
      ...fieldMetadataInput,
      icon: fieldMetadataInput.icon ?? defaultIcon,
      relationCreationPayload,
      relationTargetObjectMetadataId:
        relationCreationPayload?.targetObjectMetadataId,
      settings,
    };
  }
}
