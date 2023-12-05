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
    let result = {};
    let itemDirection = '';
    let itemFieldsString = '';
    for (const orderByItem of orderByItems) {
      // orderByItem -> field_1[AscNullsFirst]
      if (orderByItem.includes('[') && orderByItem.includes(']')) {
        const [fieldsString, direction] = orderByItem
          .replace(']', '')
          .split('[');
        // fields -> [field_1] ; direction -> AscNullsFirst
        if (!(direction in OrderByDirection)) {
          throw Error(
            `'order_by' direction '${direction}' invalid. Allowed values are '${Object.values(
              OrderByDirection,
            ).join(
              "', '",
            )}'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3`,
          );
        }
        itemDirection = direction;
        itemFieldsString = fieldsString;
      } else {
        // orderByItem -> field_3
        itemDirection = DEFAULT_ORDER_DIRECTION;
        itemFieldsString = orderByItem;
      }
      let fieldResult = {};
      itemFieldsString
        .split('.')
        .reverse()
        .forEach((field) => {
          if (Object.keys(fieldResult).length) {
            fieldResult = { [field]: fieldResult };
          } else {
            fieldResult[field] = itemDirection;
          }
        }, itemDirection);
      result = { ...result, ...fieldResult };
    }
    checkFields(objectMetadata.objectMetadataItem, Object.keys(result));
    return <RecordOrderBy>result;
  }
}
