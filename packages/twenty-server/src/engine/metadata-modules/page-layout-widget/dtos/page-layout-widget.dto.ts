import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

registerEnumType(WidgetType, { name: 'WidgetType' });

@ObjectType('GridPosition')
export class GridPositionDTO {
  @Field()
  row: number;

  @Field()
  column: number;

  @Field()
  rowSpan: number;

  @Field()
  columnSpan: number;
}

@ObjectType('PageLayoutWidget')
export class PageLayoutWidgetDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutTabId: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => WidgetType, { nullable: false })
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string;

  @Field(() => GridPositionDTO, { nullable: false })
  gridPosition: GridPositionDTO;

  @Field(() => WidgetConfiguration, { nullable: false })
  configuration: AllPageLayoutWidgetConfiguration;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
