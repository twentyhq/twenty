import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { Type } from 'class-transformer';

import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';

@InputType()
export class CreateObjectInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  nameSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  namePlural: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelSingular: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  labelPlural: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  shortcut?: string;

  @HideField()
  dataSourceId: string;

  @HideField()
  applicationId?: string;

  @HideField()
  standardId?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isRemote?: boolean;

  @IsOptional()
  @Field({ nullable: true })
  primaryKeyColumnType?: string;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  primaryKeyFieldMetadataSettings?: FieldMetadataSettings<FieldMetadataType>;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true }) // Not nullable to me
  isLabelSyncedWithName?: boolean;
}

@InputType()
export class CreateOneObjectInput {
  @Type(() => CreateObjectInput)
  @ValidateNested()
  @Field(() => CreateObjectInput, {
    description: 'The object to create',
  })
  object!: CreateObjectInput;
}
