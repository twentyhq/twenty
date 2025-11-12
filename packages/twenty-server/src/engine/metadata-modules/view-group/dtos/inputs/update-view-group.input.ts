import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
class UpdateViewGroupInputUpdates {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  fieldMetadataId?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  fieldValue?: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;
}

@InputType()
export class UpdateViewGroupInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view group to update',
  })
  id: string;

  @Type(() => UpdateViewGroupInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewGroupInputUpdates, {
    description: 'The view group to update',
  })
  update: UpdateViewGroupInputUpdates;
}
