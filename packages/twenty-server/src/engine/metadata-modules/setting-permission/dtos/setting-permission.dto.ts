import { Field, ObjectType } from '@nestjs/graphql';

import { SettingsPermissions } from 'src/engine/metadata-modules/permissions/constants/settings-permissions.constants';

@ObjectType('SettingPermission')
export class SettingPermissionDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  roleId: string;

  @Field({ nullable: false })
  setting: SettingsPermissions;

  @Field({ nullable: true })
  canUpdateSetting?: boolean;
}
