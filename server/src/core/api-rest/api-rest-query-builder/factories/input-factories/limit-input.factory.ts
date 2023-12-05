import { Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class LimitInputFactory {
  create(request: Request) {
    if (!request.query.limit) {
      return 60;
    }
    const limit = +request.query.limit;

    if (isNaN(limit) || limit < 0) {
      throw Error(
        `limit '${request.query.limit}' is invalid. Should be an integer`,
      );
    }

    return limit;
  }
}
