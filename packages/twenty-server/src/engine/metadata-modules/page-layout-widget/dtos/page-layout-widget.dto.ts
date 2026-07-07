import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  PageLayoutWidgetConditionalDisplay,
  PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutWidgetPositionUnion } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget-position.union';
import { WidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { type PageLayoutWidgetOverrides } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

registerEnumType(WidgetType, { name: 'WidgetType' });

@ObjectType('PageLayoutWidget')
export class PageLayoutWidgetDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  applicationId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutTabId: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => WidgetType, { nullable: false })
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string;

  @Field(() => PageLayoutWidgetPositionUnion, { nullable: false })
  position: PageLayoutWidgetPosition;

  @Field(() => WidgetConfiguration, { nullable: false })
  configuration: AllPageLayoutWidgetConfiguration;

  @Field(() => GraphQLJSON, { nullable: true })
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;

  @Field(() => String, { nullable: true })
  conditionalAvailabilityExpression?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Boolean, { nullable: false })
  isActive: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Boolean, {
    nullable: true,
    deprecationReason: 'isOverridden is deprecated',
  })
  isOverridden?: boolean;

  @HideField()
  overrides?: PageLayoutWidgetOverrides | null;
}
