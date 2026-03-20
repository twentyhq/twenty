import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateConnectedAccountInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  handle: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  provider: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  accessToken?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  refreshToken?: string;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  scopes?: string[];

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  userWorkspaceId: string;
}
