import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ConnectedAccountHandleDTO')
export class ConnectedAccountHandleDTO {
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  handleAliases?: string[] | null;
}
