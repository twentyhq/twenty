import { Injectable } from '@nestjs/common';

import { Request } from 'express';

@Injectable()
export class LastCursorInputFactory {
  create(request: Request) {
    const cursorQuery = request.query.last_cursor;
    if (typeof cursorQuery !== 'string') {
      return undefined;
    }
    return cursorQuery;
  }
}
