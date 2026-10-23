import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

@InputType()
export class CreateMcpServerInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  url: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  authorizationHeaderValue?: PlaintextString | null;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isEnabled?: boolean;
}
