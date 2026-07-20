import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export class CreateManyFieldsInput {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldInput)
  fields: CreateFieldInput[];
}
