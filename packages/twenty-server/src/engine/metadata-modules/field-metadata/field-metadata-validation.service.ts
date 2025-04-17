import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  validateOrReject,
} from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

enum ValueType {
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
}

class NumberSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  decimals?: number;

  @IsOptional()
  @IsEnum(ValueType)
  type?: 'percentage' | 'number';
}

class TextSettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  displayedMaxRows?: number;
}

@Injectable()
export class FieldMetadataValidationService<
  T extends FieldMetadataType = FieldMetadataType,
> {
  constructor() {}

  async validateSettingsOrThrow({
    fieldType,
    settings,
  }: {
    fieldType: FieldMetadataType;
    settings: FieldMetadataSettings<T>;
  }) {
    switch (fieldType) {
      case FieldMetadataType.NUMBER:
        await this.validateSettings(NumberSettingsValidation, settings);
        break;
      case FieldMetadataType.TEXT:
        await this.validateSettings(TextSettingsValidation, settings);
        break;
      default:
        break;
    }
  }

  private async validateSettings(validator: any, settings: any) {
    try {
      const settingsInstance = plainToInstance(validator, settings);

      await validateOrReject(settingsInstance);
    } catch (error) {
      const errorMessages = Array.isArray(error)
        ? error
            .map((err: any) => Object.values(err.constraints))
            .flat()
            .join(', ')
        : error.message;

      throw new FieldMetadataException(
        `Value for settings is invalid: ${errorMessages}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }

  async validateDefaultValueOrThrow({
    fieldType,
    defaultValue,
    options,
  }: {
    fieldType: FieldMetadataType;
    defaultValue: FieldMetadataDefaultValue<T>;
    options: FieldMetadataOptions<T>;
  }) {
    if (
      fieldType === FieldMetadataType.SELECT ||
      fieldType === FieldMetadataType.MULTI_SELECT
    ) {
      this.validateEnumDefaultValue(options, defaultValue);
    }
  }

  private validateEnumDefaultValue(
    options: FieldMetadataOptions<T>,
    defaultValue: FieldMetadataDefaultValue<T>,
  ) {
    if (typeof defaultValue === 'string') {
      const formattedDefaultValue = defaultValue.replace(
        /^['"](.*)['"]$/,
        '$1',
      );

      const enumOptions = options.map((option) => option.value);

      if (
        enumOptions &&
        (enumOptions.includes(formattedDefaultValue) ||
          enumOptions.some((option) => option.to === formattedDefaultValue))
      ) {
        return;
      }
    }
    throw new FieldMetadataException(
      `Default value for existing options is invalid: ${defaultValue}`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
}
