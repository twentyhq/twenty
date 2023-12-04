import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateVariablesFactory {
  create(request: Request) {
    return {
      data: request.body,
    };
  }
}
