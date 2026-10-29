import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
}
