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
  authorizationHeaderValue?: string | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isEnabled?: boolean;
}

@InputType()
export class UpdateMcpServerInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the MCP server to update',
  })
  id: string;

  @Type(() => UpdateMcpServerInputUpdates)
  @ValidateNested()
  @Field(() => UpdateMcpServerInputUpdates, {
    description: 'The MCP server fields to update',
  })
  update: UpdateMcpServerInputUpdates;
}
