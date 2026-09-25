import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateValidationRuleInputUpdates {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  errorFieldMetadataId?: string | null;

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Field({ nullable: true })
  expression?: string;

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Field({ nullable: true })
  message?: string;

  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateValidationRuleInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @Type(() => UpdateValidationRuleInputUpdates)
  @ValidateNested()
  @Field(() => UpdateValidationRuleInputUpdates)
  update: UpdateValidationRuleInputUpdates;
}
