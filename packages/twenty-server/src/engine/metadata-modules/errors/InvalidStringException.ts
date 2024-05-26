import { BadRequestException } from '@nestjs/common';

export class InvalidStringException extends BadRequestException {
  constructor(string: string) {
    const message = `String "${string}" is not valid`;

    super(message);
  }
}
