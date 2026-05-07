import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
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

@ObjectType('PermissionFlagDefinition')
export class PermissionFlagDefinitionDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  universalIdentifier: string;

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
  @Field(() => String, { nullable: true })
  description: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  iconKey: string | null;

  @IsIn(PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES)
  @Field(() => String)
  permissionType: PermissionFlagDefinitionPermissionType;

  @IsBoolean()
  @Field()
  isRelevantForAgents: boolean;

  @IsBoolean()
  @Field()
  isRelevantForUsers: boolean;

  @IsBoolean()
  @Field()
  isRelevantForApiKeys: boolean;

  @IsBoolean()
  @Field()
  isCustom: boolean;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
