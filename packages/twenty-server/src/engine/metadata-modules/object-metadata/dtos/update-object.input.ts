import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { type StandardOverrideTranslations } from 'src/engine/metadata-modules/utils/merge-standard-override-translations.util';

@InputType()
export class UpdateObjectPayload {
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  labelSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  labelPlural?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  @IsValidMetadataName()
  nameSingular?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  @IsValidMetadataName()
  namePlural?: string;

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

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  color?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  labelIdentifierFieldMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  imageIdentifierFieldMetadataId?: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isLabelSyncedWithName?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSearchable?: boolean;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  translations?: StandardOverrideTranslations;
}

@InputType()
export class UpdateOneObjectInput {
  @Type(() => UpdateObjectPayload)
  @ValidateNested()
  @Field(() => UpdateObjectPayload)
  update: UpdateObjectPayload;

  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the object to update',
  })
  @IsUUID()
  id!: string;
}
