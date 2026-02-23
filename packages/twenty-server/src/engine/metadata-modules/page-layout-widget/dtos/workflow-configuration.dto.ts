import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WorkflowConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WorkflowConfiguration')
export class WorkflowConfigurationDTO implements WorkflowConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WORKFLOW])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WORKFLOW;
}
