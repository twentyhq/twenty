import { BadRequestException } from '@nestjs/common';

export class ChararactersNotSupportedException extends BadRequestException {
  constructor(string: string) {
    const message = `String "${string}" contains unsupported characters`;

    super(message);
  }
}
