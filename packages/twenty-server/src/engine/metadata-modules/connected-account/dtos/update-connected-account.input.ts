import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateConnectedAccountInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  accessToken?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  refreshToken?: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  handleAliases?: string[];

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  scopes?: string[];
}

@InputType()
export class UpdateConnectedAccountInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateConnectedAccountInputUpdates)
  @ValidateNested()
  @Field(() => UpdateConnectedAccountInputUpdates)
  update: UpdateConnectedAccountInputUpdates;
}
