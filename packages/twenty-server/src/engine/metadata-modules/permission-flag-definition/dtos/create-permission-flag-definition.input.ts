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

  @IsIn(['settings', 'tool'])
  @Field()
  category: 'settings' | 'tool';

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
