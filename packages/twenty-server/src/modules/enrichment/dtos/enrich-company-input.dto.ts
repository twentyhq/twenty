import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class EnrichCompanyInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsString()
  companyId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fieldsToEnrich?: string[];
}
