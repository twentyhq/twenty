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
export class UpdateNavigationMenuItemInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  parentId?: string | null;

  // TODO(@thomtrp): remove the deprecated folderId alias once API clients use parentId
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, {
    nullable: true,
    deprecationReason: 'Use parentId instead.',
  })
  folderId?: string | null;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
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

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  color?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  pageLayoutId?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
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
