import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

@InputType()
export class UpdateMcpServerInputUpdates {
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  label?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  url?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  authorizationHeaderValue?: PlaintextString | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateMcpServerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateMcpServerInputUpdates)
  @ValidateNested()
  @Field(() => UpdateMcpServerInputUpdates)
  update: UpdateMcpServerInputUpdates;
}
