import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export class DatePickerException extends RangeError {
  constructor({ message }: { message: string }) {
    super(message);
    this.name = doNotTranslate('DatePickerException');
  }
}
