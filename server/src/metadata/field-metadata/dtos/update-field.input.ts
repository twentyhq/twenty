import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeUpdateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Type } from 'class-transformer';

import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/metadata/field-metadata/interfaces/field-metadata-options.interface';

import { BeforeUpdateOneField } from 'src/metadata/field-metadata/hooks/before-update-one-field.hook';
import { FieldMetadataComplexOptions } from 'src/metadata/field-metadata/dtos/options.input';

@InputType()
@BeforeUpdateOne(BeforeUpdateOneField)
export class UpdateFieldInput {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  // TODO: Add validation for this but we don't have the type actually
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  defaultValue?: FieldMetadataDefaultValue;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldMetadataComplexOptions)
  @Field(() => GraphQLJSON, { nullable: true })
  options?: FieldMetadataOptions;

  @HideField()
  workspaceId: string;
}
