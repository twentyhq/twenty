import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

@InputType()
export class CreateCommandMenuItemInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  workflowVersionId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

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
