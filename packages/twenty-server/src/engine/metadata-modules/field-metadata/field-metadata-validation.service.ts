import { Injectable } from '@nestjs/common';

import { z } from 'zod';

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
    const schema = z.object({
      decimals: z.number().int().nonnegative().optional(),
      type: z.enum(['percentage', 'number']).optional(),
    });

    const result = schema.safeParse(settings);

    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => err.message)
        .join(', ');

      throw new FieldMetadataException(
        `Value for settings is invalid: ${errorMessages}`,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }
  }
}
