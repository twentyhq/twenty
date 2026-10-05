import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type CallRecordingTranscriptConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('CallRecordingTranscriptConfiguration')
export class CallRecordingTranscriptConfigurationDTO implements CallRecordingTranscriptConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT;
}
