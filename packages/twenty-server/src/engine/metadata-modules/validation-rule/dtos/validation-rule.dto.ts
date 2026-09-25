import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  expression: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  message: string;

  @IsBoolean()
  @Field()
  isActive: boolean;
}
