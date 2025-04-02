import { CustomException } from 'src/utils/custom-exception';

export class MicrosoftImportDriverException extends CustomException {
  statusCode: number;
  constructor(message: string, code: string, statusCode: number) {
    super(message, code);
    this.statusCode = statusCode;
    this.code = code;
  }
}
