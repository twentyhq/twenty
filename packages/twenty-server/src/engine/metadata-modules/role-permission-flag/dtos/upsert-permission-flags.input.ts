import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertPermissionFlagsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  roleId: string;

  @IsArray()
  @IsString({ each: true })
  @Field(() => [String])
  permissionFlagKeys: string[];
}
