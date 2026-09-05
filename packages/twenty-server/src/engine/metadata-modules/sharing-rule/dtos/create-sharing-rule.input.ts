import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateSharingRuleInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsEnum(RecordSharePrincipalType)
  @IsNotEmpty()
  @Field(() => RecordSharePrincipalType)
  granteePrincipalType: RecordSharePrincipalType;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  granteePrincipalId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  granteeRoleId?: string | null;

  @IsEnum(RecordShareAccessLevel)
  @IsNotEmpty()
  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;
}
