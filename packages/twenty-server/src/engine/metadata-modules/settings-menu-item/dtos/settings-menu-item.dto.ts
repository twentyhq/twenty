import {
  Field,
  Float,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  SETTINGS_MENU_ITEM_SCOPES,
  type SettingsMenuItemScope,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

const SettingsMenuItemScopeEnum = Object.fromEntries(
  SETTINGS_MENU_ITEM_SCOPES.map((scope) => [scope, scope]),
) as { [P in SettingsMenuItemScope]: P };

registerEnumType(SettingsMenuItemScopeEnum, {
  name: 'SettingsMenuItemScope',
});

@ObjectType('SettingsMenuItem')
export class SettingsMenuItemDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  frontComponentId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  title: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsNumber()
  @Field(() => Float)
  position: number;

  @IsIn(SETTINGS_MENU_ITEM_SCOPES)
  @Field(() => SettingsMenuItemScopeEnum)
  scope: SettingsMenuItemScope;

  @IsUUID()
  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
