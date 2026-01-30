import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

registerEnumType(CommandMenuItemAvailabilityType, {
  name: 'CommandMenuItemAvailabilityType',
});

@ObjectType('CommandMenuItem')
export class CommandMenuItemDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

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
  @Field()
  isPinned: boolean;

  @IsEnum(CommandMenuItemAvailabilityType)
  @Field(() => CommandMenuItemAvailabilityType)
  availabilityType: CommandMenuItemAvailabilityType;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  availabilityObjectMetadataId?: string;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
