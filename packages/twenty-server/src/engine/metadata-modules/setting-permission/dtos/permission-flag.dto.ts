import { Field, ObjectType } from '@nestjs/graphql';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@ObjectType('PermissionFlag')
export class PermissionFlagDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  roleId: string;

  @Field({ nullable: false })
  flag: PermissionFlagType;
}
