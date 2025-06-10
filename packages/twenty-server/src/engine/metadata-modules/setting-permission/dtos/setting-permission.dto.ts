import { Field, ObjectType } from '@nestjs/graphql';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

@ObjectType('SettingPermission')
export class SettingPermissionDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  roleId: string;

  @Field({ nullable: false })
  setting: SettingPermissionType;
}
