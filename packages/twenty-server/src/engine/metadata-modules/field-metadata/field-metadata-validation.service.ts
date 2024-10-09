import { Injectable } from '@nestjs/common';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

@Injectable()
export class FieldMetadataValidationService<
  T extends FieldMetadataType | 'default' = 'default',
> {
  constructor() {}

  validateSettingsOrThrow({
    fieldType,
    settings,
  }: {
    fieldType: FieldMetadataType;
    settings: FieldMetadataSettings<T>;
  }) {
    switch (fieldType) {
      case FieldMetadataType.NUMBER:
        this.validateNumberSettings(settings);
        break;
      default:
        break;
    }
  }

  private validateNumberSettings(settings: FieldMetadataSettings<T>) {
    if ('decimals' in settings) {
      const { decimals } = settings;

      if (
        decimals !== undefined &&
        (decimals < 0 || !Number.isInteger(decimals))
      ) {
        throw new FieldMetadataException(
          `Decimals value "${decimals}" must be a positive integer`,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }
    }
  }
}
