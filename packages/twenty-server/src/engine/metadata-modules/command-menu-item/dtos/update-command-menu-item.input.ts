import { Field, Float, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

@InputType()
export class UpdateCommandMenuItemInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  label?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  shortLabel?: string;

  @IsNumber()
  @IsOptional()
  @Field(() => Float, { nullable: true })
  position?: number;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isPinned?: boolean;

  @IsEnum(CommandMenuItemAvailabilityType)
  @IsOptional()
  @Field(() => CommandMenuItemAvailabilityType, { nullable: true })
  availabilityType?: CommandMenuItemAvailabilityType;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  availabilityObjectMetadataId?: string;
}
