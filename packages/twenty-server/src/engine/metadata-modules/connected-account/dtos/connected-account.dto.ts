import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ConnectedAccountDTO')
export class ConnectedAccountDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

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
  @Field(() => String, { nullable: true })
  accessToken: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  refreshToken: string | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  lastCredentialsRefreshedAt: Date | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  authFailedAt: Date | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  handleAliases: string[] | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  scopes: string[] | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  connectionParameters: Record<string, unknown> | null;

  @IsDateString()
  @IsOptional()
  @Field(() => Date, { nullable: true })
  lastSignedInAt: Date | null;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  oidcTokenClaims: Record<string, unknown> | null;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
