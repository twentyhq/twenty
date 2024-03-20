import { Injectable } from '@nestjs/common';

import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { validateDefaultValueForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util';

@Injectable()
@ValidatorConstraint({ name: 'isFieldMetadataDefaultValue', async: true })
export class IsFieldMetadataDefaultValue
  implements ValidatorConstraintInterface
{
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  async validate(
    value: FieldMetadataDefaultValue,
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

    return validateDefaultValueForType(type, value);
  }

  defaultMessage(): string {
    return 'FieldMetadataDefaultValue is not valid';
  }
}
