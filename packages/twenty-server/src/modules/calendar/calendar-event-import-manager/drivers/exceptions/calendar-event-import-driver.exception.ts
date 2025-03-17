import { CalendarEventImportDriverExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportDriverException extends CustomException {
  constructor(message: string, code: CalendarEventImportDriverExceptionCode) {
    super(message, code);
  }
}
