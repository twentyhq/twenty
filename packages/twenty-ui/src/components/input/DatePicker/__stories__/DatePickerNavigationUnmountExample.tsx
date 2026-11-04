import { useState } from 'react';

import { Text } from '@ui/primitives/typography/Text/Text';

import { type DatePickerProps } from '../types/DatePickerProps';
import { DatePickerExample } from './DatePickerExample';

export const DatePickerNavigationUnmountExample = ({
  onNavigationOpenChange,
}: Pick<DatePickerProps, 'onNavigationOpenChange'>) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  if (!isCalendarVisible) {
    return <Text>Calendar hidden</Text>;
  }

  return (
    <DatePickerExample
      onNavigationOpenChange={onNavigationOpenChange}
      onViewedMonthChange={() => setIsCalendarVisible(false)}
    />
  );
};
