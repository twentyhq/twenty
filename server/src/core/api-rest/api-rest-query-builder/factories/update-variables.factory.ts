import { Injectable } from '@nestjs/common';

@Injectable()
export class UpdateVariablesFactory {
  create(id: string, request: Request) {
    return {
      id,
      data: request.body,
    };
  }
}
