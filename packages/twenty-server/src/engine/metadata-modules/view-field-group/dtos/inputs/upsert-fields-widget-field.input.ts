import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AtLeastOneOf } from 'src/engine/metadata-modules/view-field-group/dtos/validators/at-least-one-of.validator';

@InputType()
@AtLeastOneOf(['viewFieldId', 'fieldMetadataId'])
export class UpsertFieldsWidgetFieldInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, {
    nullable: true,
    description:
      'The id of the view field. Required if fieldMetadataId is not provided.',
  })
  viewFieldId?: string;

  @IsOptional()
  @IsUUID()
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
