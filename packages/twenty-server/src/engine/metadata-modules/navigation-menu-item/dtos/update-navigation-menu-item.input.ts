import { Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateNavigationMenuItemInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  folderId?: string | null;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  position?: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  name?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  link?: string | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  icon?: string | null;
}

@InputType()
export class UpdateOneNavigationMenuItemInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the record to update',
  })
  id!: string;

  @Type(() => UpdateNavigationMenuItemInput)
  @ValidateNested()
  @Field(() => UpdateNavigationMenuItemInput, {
    description: 'The record to update',
  })
  update!: UpdateNavigationMenuItemInput;
}
