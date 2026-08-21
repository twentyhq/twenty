import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type CallRecordingSummaryConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('CallRecordingSummaryConfiguration')
export class CallRecordingSummaryConfigurationDTO implements CallRecordingSummaryConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CALL_RECORDING_SUMMARY])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY;
}
