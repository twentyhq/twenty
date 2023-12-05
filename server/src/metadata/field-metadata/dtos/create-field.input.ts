import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';

@InputType()
export class CreateFieldInput extends OmitType(
  FieldMetadataDTO,
  ['id', 'createdAt', 'updatedAt'] as const,
  InputType,
) {
  @IsUUID()
  @Field()
  objectMetadataId: string;
}

@InputType()
export class CreateOneFieldMetadataInput {
  @Type(() => CreateFieldInput)
  @ValidateNested()
  @Field(() => CreateFieldInput, {
    description: 'The record to create',
  })
  field!: CreateFieldInput;
}
