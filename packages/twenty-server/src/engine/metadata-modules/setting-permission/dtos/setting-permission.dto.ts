import { Field, ObjectType } from '@nestjs/graphql';

import { SettingPermission } from 'src/engine/metadata-modules/permissions/constants/setting-permission.constants';

@ObjectType('SettingPermission')
export class SettingPermissionDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  roleId: string;

  @Field({ nullable: false })
  setting: SettingPermission;

  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}
