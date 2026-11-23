import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';
import {
  PageLayoutWidgetConditionalDisplay,
  PageLayoutWidgetPosition,
  WidgetType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

@InputType()
export class UpdatePageLayoutWidgetWithIdInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  pageLayoutTabId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => WidgetType)
  @IsEnum(WidgetType)
  @IsNotEmpty()
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  position?: PageLayoutWidgetPosition;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  configuration: AllPageLayoutWidgetConfiguration;

  // TODO(@neo773): conditionalDisplay and conditionalAvailabilityExpression are legacy; no deprecationReason here because the front type generation drops deprecated input fields and it still sends null to empty them. Removed with the columns
  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  conditionalAvailabilityExpression?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  conditionalAvailability?: ConditionalAvailabilityNode | null;
}
