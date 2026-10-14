import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import {
  type SerializedRelation,
  type ViewConfiguration,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('ViewConfiguration')
export class ViewConfigurationDTO implements ViewConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.VIEW])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.VIEW;

  // Nullable in GraphQL only: union members must agree on the viewId type.
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsNotEmpty()
  viewId: SerializedRelation;
}
