import { Field, HideField, InputType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { FieldMetadataTargetColumnMap } from 'src/tenant/schema-builder/interfaces/field-metadata-target-column-map.interface';

import { BeforeCreateOneField } from 'src/metadata/field-metadata/hooks/before-create-one-field.hook';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

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

  @HideField()
  targetColumnMap: FieldMetadataTargetColumnMap;

  @HideField()
  workspaceId: string;
}
