import { Field, InputType } from '@nestjs/graphql';

import { type ConnectionProviderScope } from 'twenty-shared/application';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ConnectionProviderScopeEnum } from 'src/engine/core-modules/application/connection-provider/dtos/application-connection-provider.dto';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  connectionProviderId?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsIn(Object.values(ConnectionProviderScopeEnum))
  @IsOptional()
  @Field(() => ConnectionProviderScopeEnum, { nullable: true })
  signInScope?: ConnectionProviderScope;
}
