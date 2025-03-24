import { Field, ObjectType } from '@nestjs/graphql';

import { Setting } from 'src/engine/metadata-modules/permissions/constants/setting.constants';
@ObjectType('SettingPermission')
export class SettingPermissionDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  roleId: string;

  @Field({ nullable: false })
  setting: Setting;

  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}
