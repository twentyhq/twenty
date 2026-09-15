import { Field, InputType } from '@nestjs/graphql';

import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  PERMISSION_FLAG_PERMISSION_TYPES,
  type PermissionFlagPermissionType,
} from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';

@InputType()
export class CreatePermissionFlagInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  key: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsIn(PERMISSION_FLAG_PERMISSION_TYPES)
  @Field(() => String)
  permissionType: PermissionFlagPermissionType;
}
