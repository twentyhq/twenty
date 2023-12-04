import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteVariablesFactory {
  create(id: string) {
    return {
      id: id,
    };
  }
}
