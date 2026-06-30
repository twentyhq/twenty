import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  PERMISSION_FLAG_PERMISSION_TYPES,
  type PermissionFlagPermissionType,
} from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';

@InputType()
export class UpdatePermissionFlagInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  label?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsOptional()
  @IsIn(PERMISSION_FLAG_PERMISSION_TYPES)
  @Field(() => String, { nullable: true })
  permissionType?: PermissionFlagPermissionType;
}

@InputType()
export class UpdatePermissionFlagInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the permission flag definition to update',
  })
  id: string;

  @Type(() => UpdatePermissionFlagInputUpdates)
  @ValidateNested()
  @Field(() => UpdatePermissionFlagInputUpdates, {
    description: 'The fields to update',
  })
  update: UpdatePermissionFlagInputUpdates;
}
