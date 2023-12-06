import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { addDefaultConjunctionIfMissing } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/add-default-conjunction.utils';
import { checkFilterQuery } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/check-filter-query.utils';
import { parseFilter } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-filter.utils';

@Injectable()
export class FilterInputFactory {
  create(request: Request, objectMetadata) {
    let filterQuery = request.query.filter;

    if (typeof filterQuery !== 'string') {
      return {};
    }

    checkFilterQuery(filterQuery);

    filterQuery = addDefaultConjunctionIfMissing(filterQuery);

    return parseFilter(filterQuery, objectMetadata.objectMetadataItem);
  }
}
