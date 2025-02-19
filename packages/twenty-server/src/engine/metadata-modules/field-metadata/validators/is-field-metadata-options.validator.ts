import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared';
import { Repository } from 'typeorm';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { validateOptionsForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-options-for-type.util';

@Injectable()
@ValidatorConstraint({ name: 'isFieldMetadataOptions', async: true })
export class IsFieldMetadataOptions {
  private validationErrors: string[] = [];

  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

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
        fieldMetadata = await this.fieldMetadataRepository.findOneOrFail({
          where: { id },
        });
      } catch {
        return false;
      }

      type = fieldMetadata.type;
    }

    try {
      return validateOptionsForType(type, value);
    } catch (err) {
      this.validationErrors.push(err.message);

      return false;
    }
  }
}
