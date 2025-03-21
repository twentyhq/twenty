import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';

@InputType()
export class UpsertSettingPermissionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  @Field({ nullable: false })
  setting: SettingsPermissions;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}
