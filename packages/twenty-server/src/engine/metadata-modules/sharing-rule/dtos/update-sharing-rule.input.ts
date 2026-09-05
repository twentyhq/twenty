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
export class UpdateSharingRuleInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsEnum(RecordSharePrincipalType)
  @IsOptional()
  @Field(() => RecordSharePrincipalType, { nullable: true })
  granteePrincipalType?: RecordSharePrincipalType;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  granteePrincipalId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  granteeRoleId?: string | null;

  @IsEnum(RecordShareAccessLevel)
  @IsOptional()
  @Field(() => RecordShareAccessLevel, { nullable: true })
  accessLevel?: RecordShareAccessLevel;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;
}
