import { Field, InputType } from '@nestjs/graphql';

import {
  CONNECTION_PROVIDER_SCOPES,
  type ConnectionProviderScope,
} from 'twenty-shared/application';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ConnectionProviderScopeEnum } from 'src/engine/core-modules/application/connection-provider/dtos/connection-provider-scope.enum';
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

  @IsIn(CONNECTION_PROVIDER_SCOPES)
  @IsOptional()
  @Field(() => ConnectionProviderScopeEnum, { nullable: true })
  signInScope?: ConnectionProviderScope;
}
