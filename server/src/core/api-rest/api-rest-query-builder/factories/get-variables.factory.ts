import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { LastCursorParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/last-cursor-parser.factory';
import { LimitParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/limit-parser.factory';
import { OrderByParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/order-by-parser.factory';
import { FilterParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/filter-parser.factory';

@Injectable()
export class GetVariablesFactory {
  constructor(
    private readonly lastCursorParserFactory: LastCursorParserFactory,
    private readonly limitParserFactory: LimitParserFactory,
    private readonly orderByParserFactory: OrderByParserFactory,
    private readonly filterParserFactory: FilterParserFactory,
  ) {}
  create(id: string | undefined, request: Request, objectMetadata) {
    if (id) {
      return { filter: { id: { eq: id } } };
    } else {
      return {
        filter: this.filterParserFactory.create(request, objectMetadata),
        orderBy: this.orderByParserFactory.create(request, objectMetadata),
        limit: this.limitParserFactory.create(request),
        lastCursor: this.lastCursorParserFactory.create(request),
      };
    }
  }
}
