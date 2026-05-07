import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES,
  type PermissionFlagDefinitionPermissionType,
} from 'src/engine/metadata-modules/permission-flag-definition/constants/permission-flag-definition-permission-type.constant';

@InputType()
export class CreatePermissionFlagDefinitionInput {
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
  iconKey?: string;

  @IsIn(PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES)
  @Field(() => String)
  permissionType: PermissionFlagDefinitionPermissionType;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRelevantForAgents?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRelevantForUsers?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRelevantForApiKeys?: boolean;
}
