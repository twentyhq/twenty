import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES,
  type PermissionFlagDefinitionPermissionType,
} from 'src/engine/metadata-modules/permission-flag-definition/constants/permission-flag-definition-permission-type.constant';

@InputType()
export class UpdatePermissionFlagDefinitionInputUpdates {
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
  iconKey?: string;

  @IsOptional()
  @IsIn(PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES)
  @Field(() => String, { nullable: true })
  permissionType?: PermissionFlagDefinitionPermissionType;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isRelevantForAgents?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isRelevantForUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isRelevantForApiKeys?: boolean;
}

@InputType()
export class UpdatePermissionFlagDefinitionInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the permission flag definition to update',
  })
  id: string;

  @Type(() => UpdatePermissionFlagDefinitionInputUpdates)
  @ValidateNested()
  @Field(() => UpdatePermissionFlagDefinitionInputUpdates, {
    description: 'The fields to update',
  })
  update: UpdatePermissionFlagDefinitionInputUpdates;
}
