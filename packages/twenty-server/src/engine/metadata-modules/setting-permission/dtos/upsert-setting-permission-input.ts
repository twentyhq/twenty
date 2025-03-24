import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { SettingPermission } from 'src/engine/metadata-modules/permissions/constants/setting-permission.constants';

@InputType()
export class UpsertSettingPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  @Field({ nullable: false })
  setting: SettingPermission;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}
