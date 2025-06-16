import { Injectable } from '@nestjs/common';

import { ClassConstructor, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidationError,
  validateOrReject,
} from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

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
export class FieldMetadataValidationService<
  T extends FieldMetadataType = FieldMetadataType,
> {
  constructor() {}

  async validateRelationCreationPayloadOrThrow(
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

  async validateSettingsOrThrow({
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
    settings: FieldMetadataSettings<T>,
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
}
