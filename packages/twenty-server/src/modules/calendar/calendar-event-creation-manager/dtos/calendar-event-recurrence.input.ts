import { Field, InputType, Int } from '@nestjs/graphql';

import { CalendarEventRecurrenceFrequencyEnum } from 'src/modules/calendar/calendar-event-creation-manager/enums/calendar-event-recurrence-frequency.enum';
import { CalendarEventRecurrenceWeekdayEnum } from 'src/modules/calendar/calendar-event-creation-manager/enums/calendar-event-recurrence-weekday.enum';
import { type CalendarEventRecurrenceFrequency } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-frequency.type';
import { type CalendarEventRecurrenceWeekday } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-recurrence-weekday.type';

@InputType()
export class CalendarEventRecurrenceInput {
  @Field(() => CalendarEventRecurrenceFrequencyEnum)
  frequency: CalendarEventRecurrenceFrequency;

  @Field(() => Int, { nullable: true })
  interval?: number;

  @Field(() => [CalendarEventRecurrenceWeekdayEnum], { nullable: true })
  daysOfWeek?: CalendarEventRecurrenceWeekday[];

  @Field(() => String, { nullable: true })
  endDate?: string;

  @Field(() => Int, { nullable: true })
  endOccurrenceCount?: number;
}
