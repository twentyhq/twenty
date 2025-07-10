import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidationError,
  validateOrReject,
} from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataEnumValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-enum-validation.service';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';

type ValidateFieldMetadataArgs = {
  fieldMetadataType: FieldMetadataType;
  fieldMetadataInput: CreateFieldInput | UpdateFieldInput;
  objectMetadata: ObjectMetadataItemWithFieldMaps;
  existingFieldMetadata?: FieldMetadataInterface;
};

enum ValueType {
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
  SHORT_NUMBER = 'shortNumber',
}

class NumberSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  decimals?: number;

  @IsOptional()
  @IsEnum(ValueType)
  type?: 'percentage' | 'number' | 'shortNumber';
}

class TextSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  displayedMaxRows?: number;
}

@Injectable()
export class FieldMetadataValidationService {
  constructor(
    private readonly fieldMetadataEnumValidationService: FieldMetadataEnumValidationService,
  ) {}

  async validateSettingsOrThrow<T extends FieldMetadataType>({
    fieldType,
    settings,
  }: {
    fieldType: FieldMetadataType;
    settings: FieldMetadataSettings<T>;
  }) {
    switch (fieldType) {
      case FieldMetadataType.NUMBER:
        await this.validateSettings<FieldMetadataType.NUMBER>(
          NumberSettingsValidation,
          settings,
        );
        break;
      case FieldMetadataType.TEXT:
        await this.validateSettings<FieldMetadataType.TEXT>(
          TextSettingsValidation,
          settings,
        );
        break;
      default:
        break;
    }
  }

  private async validateSettings<Type extends FieldMetadataType>(
    validator: ClassConstructor<
      Type extends FieldMetadataType.NUMBER
        ? NumberSettingsValidation
        : Type extends FieldMetadataType.TEXT
          ? TextSettingsValidation
          : never
    >,
    settings: FieldMetadataSettings<Type>,
  ) {
    try {
      const settingsInstance = plainToInstance(validator, settings);

      await validateOrReject(settingsInstance);
    } catch (error) {
      const errorMessages = Array.isArray(error)
        ? error
            .map((err: ValidationError) => Object.values(err.constraints ?? {}))
            .flat()
            .join(', ')
        : error.message;

      throw new FieldMetadataException(
        `Value for settings is invalid: ${errorMessages}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  async validateFieldMetadata({
    fieldMetadataInput,
    fieldMetadataType,
    objectMetadata,
    existingFieldMetadata,
  }: ValidateFieldMetadataArgs): Promise<void> {
    if (fieldMetadataInput.name) {
      try {
        validateMetadataNameOrThrow(fieldMetadataInput.name);
      } catch (error) {
        if (error instanceof InvalidMetadataException) {
          throw new FieldMetadataException(
            error.message,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        }

        throw error;
      }

      try {
        validateFieldNameAvailabilityOrThrow(
          fieldMetadataInput.name,
          objectMetadata,
        );
      } catch (error) {
        if (error instanceof InvalidMetadataException) {
          throw new FieldMetadataException(
            `Name "${fieldMetadataInput.name}" is not available, check that it is not duplicating another field's name.`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            {
              userFriendlyMessage: t`Name is not available, it may be duplicating another field's name.`,
            },
          );
        }

        throw error;
      }
    }

    if (fieldMetadataInput.isNullable === false) {
      if (!isDefined(fieldMetadataInput.defaultValue)) {
        throw new FieldMetadataException(
          'Default value is required for non nullable fields',
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }
    }

    if (isEnumFieldMetadataType(fieldMetadataType)) {
      await this.fieldMetadataEnumValidationService.validateEnumFieldMetadataInput(
        {
          fieldMetadataInput,
          fieldMetadataType,
          existingFieldMetadata,
        },
      );
    }

    if (fieldMetadataInput.settings) {
      await this.validateSettingsOrThrow({
        fieldType: fieldMetadataType,
        settings: fieldMetadataInput.settings,
      });
    }

    const isRelationField =
      fieldMetadataType === FieldMetadataType.RELATION ||
      fieldMetadataType === FieldMetadataType.MORPH_RELATION;

    if (
      isRelationField &&
      isDefined(existingFieldMetadata) &&
      fieldMetadataInput.name !== existingFieldMetadata.name
    ) {
      throw new FieldMetadataException(
        'Name cannot be changed for relation fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
}
