import { Injectable } from '@nestjs/common';

import { ValidationArguments, ValidatorConstraint } from 'class-validator';

import { FieldMetadataOptions } from 'src/metadata/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { validateOptionsForType } from 'src/metadata/field-metadata/utils/validate-options-for-type.util';

@Injectable()
@ValidatorConstraint({ name: 'isFieldMetadataOptions', async: true })
export class IsFieldMetadataOptions {
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  async validate(
    value: FieldMetadataOptions,
    args: ValidationArguments,
  ): Promise<boolean> {
    // Try to extract type value from the object
    let type: FieldMetadataType | null = args.object['type'];

    if (!type) {
      // Extract id value from the instance, should happen only when updating
      const id: string | undefined = args.instance?.['id'];

      if (!id) {
        return false;
      }

      let fieldMetadata: FieldMetadataEntity;

      try {
        fieldMetadata = await this.fieldMetadataService.findOneOrFail(id);
      } catch {
        return false;
      }

      type = fieldMetadata.type;
    }

    return validateOptionsForType(type, value);
  }

  defaultMessage(): string {
    return 'FieldMetadataOptions is not valid';
  }
}
