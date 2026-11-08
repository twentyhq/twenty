import { Field, InputType } from '@nestjs/graphql';

import { type ConnectionProviderScope } from 'twenty-shared/application';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { ConnectionProviderScopeEnum } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';
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
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  connectionProviderId?: string | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsOptional()
  @IsIn(Object.values(ConnectionProviderScopeEnum))
  @Field(() => ConnectionProviderScopeEnum, { nullable: true })
  signInScope?: ConnectionProviderScope;
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
