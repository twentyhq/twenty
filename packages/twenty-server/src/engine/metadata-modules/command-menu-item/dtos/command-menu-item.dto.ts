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
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
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
