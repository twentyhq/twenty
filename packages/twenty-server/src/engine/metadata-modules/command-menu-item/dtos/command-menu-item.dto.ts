import {
  Field,
  Float,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

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
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { type CommandMenuItemOverrides } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { CommandMenuItemPayloadUnion } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item-payload.union';
import { type PathCommandMenuItemPayload } from 'src/engine/metadata-modules/command-menu-item/dtos/types/path-command-menu-item-payload.type';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';

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
  payload?: PathCommandMenuItemPayload;

  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { nullable: true })
  hotKeys?: string[];

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  conditionalAvailabilityExpression?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  conditionalPinnedExpression?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  availabilityObjectMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  navigationTargetObjectMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  pageLayoutId?: string;

  @HideField()
  workspaceId: string;

  // Kept out of the schema but needed by the field resolvers: without it they
  // cannot tell a standard label from one a workspace renamed, and would match
  // the workspace's own copy against the standard catalog.
  @HideField()
  overrides?: CommandMenuItemOverrides | null;

  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;

  @Field(() => Boolean, { nullable: false })
  isActive: boolean;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
