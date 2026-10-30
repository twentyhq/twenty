import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES,
  type FrontComponentWidgetPageLayoutType,
} from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FrontComponentWidgetAvailability')
export class FrontComponentWidgetAvailabilityDTO {
  @IsIn(FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES)
  @Field(() => PageLayoutType)
  pageLayoutType: FrontComponentWidgetPageLayoutType;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string;
}
