import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ValidationArguments, ValidatorConstraint } from 'class-validator';
import {
  type FieldMetadataType,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { validateOptionsForType } from 'src/engine/metadata-modules/field-metadata/utils/validate-options-for-type.util';

@Injectable()
@ValidatorConstraint({ name: 'isFieldMetadataOptions', async: true })
export class IsFieldMetadataOptions {
  private validationErrors: string[] = [];

  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  async validate(
    value: FieldMetadataOptions,
    args: ValidationArguments,
  ): Promise<boolean> {
    // Try to extract type value from the object
    // @ts-expect-error legacy noImplicitAny
    let type: FieldMetadataType | null = args.object['type'];

    if (!type) {
      // Extract id value from the instance, should happen only when updating
      // @ts-expect-error legacy noImplicitAny
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
