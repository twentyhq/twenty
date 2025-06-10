import { Field, InputType, OmitType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

@InputType()
export class CreateFieldInput extends OmitType(
  FieldMetadataDTO,
  ['id', 'createdAt', 'updatedAt', 'standardOverrides'] as const,
  InputType,
) {
  @IsUUID()
  @Field()
  objectMetadataId: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isRemoteCreation?: boolean;
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
