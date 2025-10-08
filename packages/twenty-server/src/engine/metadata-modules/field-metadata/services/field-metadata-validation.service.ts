import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { type ClassConstructor, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  type ValidationError,
  validateOrReject,
} from 'class-validator';
import { MIN_MAX_NUMBER_OF_VALUES } from 'twenty-shared/constants';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
  CURRENCY_FORMAT,
  type CurrencyFormat,
  DateDisplayFormat,
  FIELD_NUMBER_VARIANT,
  type FieldMetadataSettings,
  FieldMetadataType,
  type FieldNumberVariant,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataEnumValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-enum-validation.service';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name-or-throw.utils';

type ValidateFieldMetadataArgs = {
  fieldMetadataType: FieldMetadataType;
  fieldMetadataInput: CreateFieldInput | UpdateFieldInput;
  objectMetadata: ObjectMetadataItemWithFieldMaps;
  existingFieldMetadata?: FieldMetadataEntity;
};

class NumberSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  decimals?: number;

  @IsOptional()
  @IsEnum(FIELD_NUMBER_VARIANT)
  type?: FieldNumberVariant;
}

class TextSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  displayedMaxRows?: number;
}

class CurrencySettingsValidation {
  @IsOptional()
  @IsEnum(CURRENCY_FORMAT)
  format?: CurrencyFormat;
}

class DateSettingsValidation {
  @IsOptional()
  @IsEnum(DateDisplayFormat)
  displayFormat?: DateDisplayFormat;

  @IsOptional()
  customUnicodeDateFormat?: string;
}

class DateTimeSettingsValidation {
  @IsOptional()
  @IsEnum(DateDisplayFormat)
  displayFormat?: DateDisplayFormat;

  @IsOptional()
  customUnicodeDateFormat?: string;
}

class AddressSettingsValidation {
  @IsOptional()
  @IsArray()
  @IsEnum(ALLOWED_ADDRESS_SUBFIELDS, { each: true })
  subFields?: AllowedAddressSubField[];
}

class MultipleValuesSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(MIN_MAX_NUMBER_OF_VALUES)
  maxNumberOfValues?: number;
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
        await this.validateSettings({
          type: FieldMetadataType.NUMBER,
          validator: NumberSettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.TEXT:
        await this.validateSettings({
          type: FieldMetadataType.TEXT,
          validator: TextSettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.CURRENCY:
        await this.validateSettings({
          type: FieldMetadataType.CURRENCY,
          validator: CurrencySettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.DATE:
        await this.validateSettings({
          type: FieldMetadataType.DATE,
          validator: DateSettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.DATE_TIME:
        await this.validateSettings({
          type: FieldMetadataType.DATE_TIME,
          validator: DateTimeSettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.ADDRESS:
        await this.validateSettings({
          type: FieldMetadataType.ADDRESS,
          validator: AddressSettingsValidation,
          settings,
        });
        break;
      case FieldMetadataType.PHONES:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.ARRAY:
        await this.validateSettings({
          type: fieldType,
          validator: MultipleValuesSettingsValidation,
          settings,
        });
        break;
      default:
        break;
    }
  }

  private async validateSettings<
    Type extends FieldMetadataType,
    TValidator extends ClassConstructor<object>,
    TFieldMetadataType extends FieldMetadataType,
  >({
    type: _type,
    settings,
    validator,
  }: {
    validator: TValidator;
    settings: FieldMetadataSettings<Type>;
    type: TFieldMetadataType;
  }) {
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
            {
              userFriendlyMessage: error.userFriendlyMessage,
            },
          );
        }

        throw error;
      }

      try {
        validateFieldNameAvailabilityOrThrow({
          name: fieldMetadataInput.name,
          fieldMetadataMapById: objectMetadata.fieldsById,
        });
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
      isDefined(fieldMetadataInput.name) &&
      fieldMetadataInput.name !== existingFieldMetadata.name
    ) {
      throw new FieldMetadataException(
        'Name cannot be changed for relation fields',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
}
