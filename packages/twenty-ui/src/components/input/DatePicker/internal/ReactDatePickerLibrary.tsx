import { lazy } from 'react';
import { type default as ReactDatePicker } from 'react-datepicker';

export const ReactDatePickerLibrary = lazy<typeof ReactDatePicker>(async () => {
  const datePickerModule: {
    default: typeof ReactDatePicker | { default: typeof ReactDatePicker };
  } = await import('react-datepicker');
  const datePicker = datePickerModule.default;

  return {
    default: 'default' in datePicker ? datePicker.default : datePicker,
  };
});
