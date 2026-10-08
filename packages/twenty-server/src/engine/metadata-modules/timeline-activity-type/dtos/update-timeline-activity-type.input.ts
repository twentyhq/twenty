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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataTranslationOverrideInput } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translation-override.input';

@InputType()
export class UpdateTimelineActivityTypeInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @Type(() => MetadataTranslationOverrideInput)
  @ValidateNested({ each: true })
  @IsOptional()
  @Field(() => [MetadataTranslationOverrideInput], { nullable: true })
  translations?: MetadataTranslationOverrideInput[];
}
