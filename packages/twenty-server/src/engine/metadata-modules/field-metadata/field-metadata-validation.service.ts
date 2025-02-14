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
import { FieldMetadataType } from 'twenty-shared';

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
  T extends FieldMetadataType | 'default' = 'default',
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
}
