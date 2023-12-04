import { Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class LimitParserFactory {
  create(request: Request) {
    const limitQuery = request.query.limit;
    if (typeof limitQuery !== 'string') {
      return 60;
    }
    const limitParsed = parseInt(limitQuery);
    if (!Number.isInteger(limitParsed)) {
      throw Error(`limit '${limitQuery}' is invalid. Should be an integer`);
    }
    return limitParsed;
  }
}
