import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { NAVIGATION_MENU_ITEM_COMMAND_KEYS } from 'twenty-shared/constants';
import { type NavigationMenuItemCommandKey } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';

@InputType()
export class CreateNavigationMenuItemInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  userWorkspaceId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  targetRecordId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  targetObjectMetadataId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  viewId?: string | null;

  @IsEnum(NavigationMenuItemType)
  @Field(() => NavigationMenuItemType)
  type: NavigationMenuItemType;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  visibleItemLimit?: number | null;

  @IsOptional()
  @IsIn(NAVIGATION_MENU_ITEM_COMMAND_KEYS)
  @Field(() => String, { nullable: true })
  commandKey?: NavigationMenuItemCommandKey | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  folderId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  pageLayoutId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  agentChatChannelId?: string | null;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  position?: number;
}
