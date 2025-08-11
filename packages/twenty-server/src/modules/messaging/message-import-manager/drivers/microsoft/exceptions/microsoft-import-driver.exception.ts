import { CustomException } from 'src/utils/custom-exception';

export class MicrosoftImportDriverException extends CustomException<string> {
  statusCode: number;
  constructor(
    message: string,
    code: string,
    statusCode: number,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? message,
    });
    this.statusCode = statusCode;
  }
}
