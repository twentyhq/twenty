import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertFieldsWidgetFieldInput {
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.fieldMetadataId)
  @IsNotEmpty({
    message: 'viewFieldId is required when fieldMetadataId is not provided',
  })
  @Field(() => UUIDScalarType, {
    nullable: true,
    description:
      'The id of the view field. Required if fieldMetadataId is not provided.',
  })
  viewFieldId?: string;

  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => !o.viewFieldId)
  @IsNotEmpty({
    message: 'fieldMetadataId is required when viewFieldId is not provided',
  })
  @Field(() => UUIDScalarType, {
    nullable: true,
    description:
      'The id of the field metadata. Used to create a new view field when viewFieldId is not provided.',
  })
  fieldMetadataId?: string;

  @IsBoolean()
  @Field()
  isVisible: boolean;

  @IsNumber()
  @Field()
  position: number;
}
