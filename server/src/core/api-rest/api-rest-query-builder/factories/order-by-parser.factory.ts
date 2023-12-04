import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import {
  OrderByDirection,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { checkFields } from 'src/core/api-rest/utils/metadata-query.utils';

const DEFAULT_ORDER_DIRECTION = OrderByDirection.AscNullsFirst;

@Injectable()
export class OrderByParserFactory {
  create(request: Request, objectMetadata) {
    //?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3
    const orderByQuery = request.query.order_by;
    if (typeof orderByQuery !== 'string') {
      return {};
    }
    const orderByItems = orderByQuery.split(',');
    const result = {};
    for (const orderByItem of orderByItems) {
      // orderByItem -> field_1[AscNullsFirst]
      if (orderByItem.includes('[') && orderByItem.includes(']')) {
        const [field, direction] = orderByItem.replace(']', '').split('[');
        // field -> field_1 ; direction -> AscNullsFirst
        if (!(direction in OrderByDirection)) {
          throw Error(
            `'order_by' direction '${direction}' invalid. Allowed values are '${Object.values(
              OrderByDirection,
            ).join(
              "', '",
            )}'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3`,
          );
        }
        result[field] = direction;
      } else {
        // orderByItem -> field_3
        result[orderByItem] = DEFAULT_ORDER_DIRECTION;
      }
    }
    checkFields(objectMetadata.objectMetadataItem, Object.keys(result));
    return <RecordOrderBy>result;
  }
}
