import { CalendarEventImportExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportException extends CustomException {
  constructor(message: string, code: CalendarEventImportExceptionCode) {
    super(message, code);
  }
}
