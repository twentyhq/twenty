import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';
import { type NotesConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('NotesConfiguration')
export class NotesConfigurationDTO implements NotesConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.NOTES])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.NOTES;
}
