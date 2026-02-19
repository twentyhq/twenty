import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsUUID } from 'class-validator';
import { type FrontComponentConfiguration } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('FrontComponentConfiguration')
export class FrontComponentConfigurationDTO
  implements FrontComponentConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FRONT_COMPONENT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FRONT_COMPONENT;

  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  frontComponentId: string;
}
