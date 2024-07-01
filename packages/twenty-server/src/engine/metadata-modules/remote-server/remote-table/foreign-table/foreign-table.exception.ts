import { CustomException } from 'src/utils/custom-exception';

export class ForeignTableException extends CustomException {
  code: ForeignTableExceptionCode;
  constructor(message: string, code: ForeignTableExceptionCode) {
    super(message, code);
  }
}

export enum ForeignTableExceptionCode {
  FOREIGN_TABLE_MUTATION_NOT_ALLOWED = 'FOREIGN_TABLE_MUTATION_NOT_ALLOWED',
  INVALID_FOREIGN_TABLE_INPUT = 'INVALID_FOREIGN_TABLE_INPUT',
}
