import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  PageLayoutWidgetConditionalDisplay,
  PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

@InputType()
export class UpdatePageLayoutWidgetInput {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  pageLayoutTabId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => WidgetType, { nullable: true })
  @IsEnum(WidgetType)
  @IsOptional()
  type?: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  position?: PageLayoutWidgetPosition;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  configuration?: AllPageLayoutWidgetConfiguration;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  conditionalAvailabilityExpression?: string | null;
}
