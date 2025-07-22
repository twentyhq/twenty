import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

@InputType()
export class UpsertPermissionFlagsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  roleId: string;

  @IsArray()
  @IsEnum(PermissionFlagType, { each: true })
  @Field(() => [PermissionFlagType])
  permissionFlagKeys: PermissionFlagType[];
}
