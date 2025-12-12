import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertPermissionFlagsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  roleId: string;

  @IsArray()
  @IsEnum(PermissionFlagType, { each: true })
  @Field(() => [PermissionFlagType])
  permissionFlagKeys: PermissionFlagType[];
}
