import { Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { NAVIGATION_MENU_ITEM_VISIBLE_ITEM_LIMIT_MAX } from 'src/engine/metadata-modules/navigation-menu-item/constants/navigation-menu-item-visible-item-limit-max.constant';
import { NAVIGATION_MENU_ITEM_VISIBLE_ITEM_LIMIT_MIN } from 'src/engine/metadata-modules/navigation-menu-item/constants/navigation-menu-item-visible-item-limit-min.constant';
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

  @IsOptional()
  @IsInt()
  @Min(NAVIGATION_MENU_ITEM_VISIBLE_ITEM_LIMIT_MIN)
  @Max(NAVIGATION_MENU_ITEM_VISIBLE_ITEM_LIMIT_MAX)
  @Field(() => Int, { nullable: true })
  visibleItemLimit?: number | null;

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
