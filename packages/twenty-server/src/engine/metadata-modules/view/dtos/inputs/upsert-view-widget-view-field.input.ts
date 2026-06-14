import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AtLeastOneOf } from 'src/engine/metadata-modules/view-field-group/dtos/validators/at-least-one-of.validator';

@InputType()
@AtLeastOneOf(['viewFieldId', 'fieldMetadataId'])
export class UpsertViewWidgetViewFieldInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, {
    nullable: true,
    description: 'The id of an existing view field to update.',
  })
  viewFieldId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, {
    nullable: true,
    description:
      'The field metadata id. Used to create a new view field when viewFieldId is not provided.',
  })
  fieldMetadataId?: string;

  @IsBoolean()
  @Field()
  isVisible: boolean;

  @IsNumber()
  @Field()
  position: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  size?: number;
}
