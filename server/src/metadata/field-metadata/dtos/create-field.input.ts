import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';
import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import { BeforeCreateOneField } from 'src/metadata/field-metadata/hooks/before-create-one-field.hook';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { IsDefaultValue } from 'src/metadata/field-metadata/validators/is-default-value.validator';

@InputType()
@BeforeCreateOne(BeforeCreateOneField)
export class CreateFieldInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsEnum(FieldMetadataType)
  @IsNotEmpty()
  @Field(() => FieldMetadataType)
  type: FieldMetadataType;

  @IsUUID()
  @Field()
  objectMetadataId: string;

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
  isNullable: boolean;

  @IsDefaultValue({ message: 'Invalid default value for the specified type' })
  @IsOptional()
  @Field(() => graphqlTypeJson, { nullable: true })
  defaultValue: FieldMetadataDefaultValue;

  @HideField()
  targetColumnMap: FieldMetadataTargetColumnMap;

  @HideField()
  workspaceId: string;
}
