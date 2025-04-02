import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

@InputType({ description: 'Input for upserting a setting permission' })
export class UpsertSettingPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  @Field({ nullable: false })
  setting: SettingPermissionType;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}

@InputType()
export class UpsertSettingPermissionsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsArray()
  @IsEnum(SettingPermissionType, { each: true })
  @Field(() => [SettingPermissionType])
  settingPermissionKeys: SettingPermissionType[];
}
