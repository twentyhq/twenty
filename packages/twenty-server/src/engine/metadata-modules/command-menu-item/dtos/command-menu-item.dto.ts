import { Field, Float, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import {
  type CommandMenuItemPayload,
  CommandMenuItemPayloadUnion,
} from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';

@ObjectType('CommandMenuItem')
export class CommandMenuItemDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  workflowVersionId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  frontComponentId?: string;

  @Field(() => FrontComponentDTO, { nullable: true })
  frontComponent?: FrontComponentDTO | null;

  @IsEnum(EngineComponentKey)
  @IsNotEmpty()
  @Field(() => EngineComponentKey)
  engineComponentKey: EngineComponentKey;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  shortLabel?: string;

  @IsNumber()
  @Field(() => Float)
  position: number;

  @IsBoolean()
  @Field()
  isPinned: boolean;

  @IsEnum(CommandMenuItemAvailabilityType)
  @Field(() => CommandMenuItemAvailabilityType)
  availabilityType: CommandMenuItemAvailabilityType;

  @IsOptional()
  @Field(() => CommandMenuItemPayloadUnion, { nullable: true })
  payload?: CommandMenuItemPayload;

  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  hotKeys?: string[];

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  conditionalAvailabilityExpression?: string;

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
