import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type ValidationRuleBindings } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ValidationRule')
export class ValidationRuleDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  errorFieldMetadataId: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  expression: string;

  @IsObject()
  @Field(() => GraphQLJSON)
  bindings: ValidationRuleBindings;

  @IsString()
  @IsNotEmpty()
  @Field()
  message: string;

  @IsBoolean()
  @Field()
  isActive: boolean;
}
