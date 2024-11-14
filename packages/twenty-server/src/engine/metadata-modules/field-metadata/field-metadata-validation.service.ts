import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  validateOrReject,
} from 'class-validator';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

enum ValueType {
  PERCENTAGE = 'percentage',
  NUMBER = 'number',
}

class SettingsValidation {
  @IsOptional()
  @IsInt()
  @Min(0)
  decimals?: number;

  @IsOptional()
  @IsEnum(ValueType)
  type?: 'percentage' | 'number';
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
        await this.validateNumberSettings(settings);
        break;
      default:
        break;
    }
  }

  private async validateNumberSettings(settings: any) {
    try {
      const settingsInstance = plainToInstance(SettingsValidation, settings);

      await validateOrReject(settingsInstance);
    } catch (errors) {
      const errorMessages = errors
        .map((error: any) => Object.values(error.constraints))
        .flat()
        .join(', ');

      throw new FieldMetadataException(
        `Value for settings is invalid: ${errorMessages}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
}
