import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import {
  addDefaultConjunctionIfMissing,
  checkFilterQuery,
  parseStringFilter,
} from 'src/core/api-rest/utils/filter-query.utils';

@Injectable()
export class FilterParserFactory {
  create(request: Request, objectMetadata) {
    let filterQuery = request.query.filter;
    if (typeof filterQuery !== 'string') {
      return {};
    }
    filterQuery = filterQuery.replace(/%22/g, '"').replace(/%27/, "'");
    checkFilterQuery(filterQuery);
    filterQuery = addDefaultConjunctionIfMissing(filterQuery);
    return parseStringFilter(filterQuery, objectMetadata.objectMetadataItem);
  }
}
