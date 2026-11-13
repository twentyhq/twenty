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
class UpdateViewTabInputUpdates {
  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  fieldValue?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  name?: string | null;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;
}

@InputType()
export class UpdateViewTabInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view tab to update',
  })
  id: string;

  @Type(() => UpdateViewTabInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewTabInputUpdates, {
    description: 'The view tab to update',
  })
  update: UpdateViewTabInputUpdates;
}
