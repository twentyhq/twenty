import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type WorkflowRunConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('WorkflowRunConfiguration')
export class WorkflowRunConfigurationDTO implements WorkflowRunConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.WORKFLOW_RUN])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.WORKFLOW_RUN;
}
