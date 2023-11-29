import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

import {
  OrderByDirection,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { capitalize } from 'src/utils/capitalize';

const FILTER_COMPARATORS = ['eq', 'gt', 'gte', 'lt', 'lte'];
const ALLOWED_DEPTH_VALUES = [1, 2];
const DEFAULT_DEPTH_VALUE = 2;
@Injectable()
export class ApiRestService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly environmentService: EnvironmentService,
  ) {}

  mapFieldMetadataToGraphQLQuery(
    objectMetadataItems,
    field,
    maxDepthForRelations = DEFAULT_DEPTH_VALUE,
  ): any {
    if (maxDepthForRelations <= 0) {
      return '';
    }

    // TODO: parse
    const fieldType = field.type;

    const fieldIsSimpleValue = [
      'UUID',
      'TEXT',
      'PHONE',
      'DATE_TIME',
      'EMAIL',
      'NUMBER',
      'BOOLEAN',
    ].includes(fieldType);

    if (fieldIsSimpleValue) {
      return field.name;
    } else if (
      fieldType === 'RELATION' &&
      field.toRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.toRelationMetadata as any)?.fromObjectMetadata?.id,
      );

      return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .filter((field) => field.type !== 'RELATION')
        .map((field) =>
          this.mapFieldMetadataToGraphQLQuery(
            objectMetadataItems,
            field,
            maxDepthForRelations - 1,
          ),
        )
        .join('\n')}
    }`;
    } else if (
      fieldType === 'RELATION' &&
      field.fromRelationMetadata?.relationType === 'ONE_TO_MANY'
    ) {
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id ===
          (field.fromRelationMetadata as any)?.toObjectMetadata?.id,
      );

      return `${field.name}
      {
        edges {
          node {
            id
            ${(relationMetadataItem?.fields ?? [])
              .filter((field) => field.type !== 'RELATION')
              .map((field) =>
                this.mapFieldMetadataToGraphQLQuery(
                  objectMetadataItems,
                  field,
                  maxDepthForRelations - 1,
                ),
              )
              .join('\n')}
          }
        }
      }`;
    } else if (fieldType === 'LINK') {
      return `
      ${field.name}
      {
        label
        url
      }
    `;
    } else if (fieldType === 'CURRENCY') {
      return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
    } else if (fieldType === 'FULL_NAME') {
      return `
      ${field.name}
      {
        firstName
        lastName
      }
    `;
    }
  }

  async computeQuery(
    objectMetadataItems,
    objectMetadataItem,
    depth = DEFAULT_DEPTH_VALUE,
  ): Promise<string> {
    return `
      query FindMany${capitalize(objectMetadataItem.namePlural)}(
        $filter: ${capitalize(objectMetadataItem.nameSingular)}FilterInput,
        $orderBy: ${capitalize(objectMetadataItem.nameSingular)}OrderByInput,
        $lastCursor: String,
        $limit: Float = 60
        ) {
        ${objectMetadataItem.namePlural}(
        filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor
        ) {
          edges {
            node {
              id
              ${objectMetadataItem.fields
                .map((field) =>
                  this.mapFieldMetadataToGraphQLQuery(
                    objectMetadataItems,
                    field,
                    depth,
                  ),
                )
                .join('\n')}
              }
            cursor
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `;
  }

  async getObjectMetadata(request: Request, workspaceId: string) {
    const objectMetadataItems =
      await this.objectMetadataService.getObjectMetadataFromWorkspaceId(
        workspaceId,
      );
    const parsedObject = this.parseObject(request)[0];
    const objectMetadata = objectMetadataItems.filter(
      (object) => object.namePlural === parsedObject,
    );
    if (!objectMetadata.length) {
      const objectMetadata = objectMetadataItems.filter(
        (object) => object.nameSingular === parsedObject,
      );
      let hint = 'eg: companies';
      if (objectMetadata.length) {
        hint = `Did you mean '${objectMetadata[0].namePlural}'?`;
      }
      throw Error(`object '${parsedObject}' not found. ${hint}`);
    }
    return [objectMetadataItems, objectMetadata[0]];
  }

  //TODO: make it work for ?filter=eq(createdAt=2023-07-14T15:09:17.679Z)
  parseFilter(filterQuery, objectMetadataItem, parsedObjectId?: string) {
    //?filter=eq(field_1=value),gt(field_2=value)
    //?filter=or(price[gte]=10,and(price[lte]=100,price[lte]=100),not(price[lte]=100))
    //?filter=price[gte]=10,price[lte]=100 simple-version
    if (parsedObjectId) {
      return { id: { eq: parsedObjectId } };
    }
    if (typeof filterQuery !== 'string') {
      return {};
    }
    const result: { [x: string]: { [x: string]: { [x: string]: string } }[] } =
      {
        and: [],
      };
    const filterItems = filterQuery.split(',');
    for (const filterItem of filterItems) {
      if (!filterItem.match('^\\w+\\([\\w^,]+=[^,]+\\)$')) {
        throw Error(
          `'filter' invalid for ${filterItem}. eg: ?filter=eq(field_1=value),gt(field_2=value)`,
        );
      }
      const [comparator, fieldValue] = filterItem.replace(')', '').split('(');
      if (!FILTER_COMPARATORS.includes(comparator)) {
        throw Error(
          `'filter' invalid for ${filterItem}, comparator ${comparator} not in ${FILTER_COMPARATORS.join(
            ',',
          )}`,
        );
      }
      const [field, value] = fieldValue.split(/=(.+)/, 2);
      if (
        !objectMetadataItem.fields.map((field) => field.name).includes(field)
      ) {
        throw Error(
          `'filter' field '${field}' does not exist in '${objectMetadataItem.targetTableName}' object`,
        );
      }
      result.and.push({ [field]: { [comparator]: value } });
    }
    return result;
  }

  parseOrderBy(orderByQuery, objectMetadataItem) {
    //?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3
    if (typeof orderByQuery !== 'string') {
      return {};
    }
    const orderByItems = orderByQuery.split(',');
    const result = {};
    for (const orderByItem of orderByItems) {
      if (orderByItem.includes('[') && orderByItem.includes(']')) {
        const [field, direction] = orderByItem.replace(']', '').split('[');
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
        result[orderByItem] = OrderByDirection.AscNullsFirst;
      }
    }
    for (const orderByField of Object.keys(result)) {
      if (
        !objectMetadataItem.fields
          .map((field) => field.name)
          .includes(orderByField)
      ) {
        throw Error(
          `'order_by' field '${orderByField}' does not exist in '${objectMetadataItem.targetTableName}' object`,
        );
      }
    }
    return <RecordOrderBy>result;
  }

  parseLimit(limitQuery) {
    if (typeof limitQuery !== 'string') {
      return 60;
    }
    return parseInt(limitQuery);
  }

  parseCursor(cursorQuery) {
    if (typeof cursorQuery !== 'string') {
      return undefined;
    }
    return cursorQuery;
  }

  computeVariables(
    request: Request,
    objectMetadataItem,
  ): {
    orderBy: object;
    filter: object;
    limit: number;
    lastCursor?: string;
  } {
    const parsedObjectId = this.parseObject(request)[1];
    return {
      filter: this.parseFilter(
        request.query.filter,
        objectMetadataItem,
        parsedObjectId,
      ),
      orderBy: this.parseOrderBy(request.query.order_by, objectMetadataItem),
      limit: this.parseLimit(request.query.limit),
      lastCursor: this.parseCursor(request.query.last_cursor),
    };
  }

  parseObject(request) {
    const queryAction = request.path.replace('/api/', '').split('/');
    if (queryAction.length > 2) {
      throw Error(
        `Query path '${request.path}' invalid. Valid examples: /api/companies/id or /api/companies`,
      );
    }
    if (queryAction.length === 1) {
      return [queryAction[0], undefined];
    }
    return queryAction;
  }

  extractWorkspaceId(request: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!token) {
      throw Error('missing authentication token');
    }
    return verify(token, this.environmentService.getAccessTokenSecret())[
      'workspaceId'
    ];
  }

  computeDepth(request): number {
    const depth =
      typeof request.query.depth === 'string'
        ? parseInt(request.query.depth)
        : DEFAULT_DEPTH_VALUE;
    if (!ALLOWED_DEPTH_VALUES.includes(depth)) {
      throw Error(
        `'depth=${depth}' parameter invalid. Allowed values are ${ALLOWED_DEPTH_VALUES.join(
          ', ',
        )}`,
      );
    }
    return depth;
  }

  async callGraphql(request: Request) {
    try {
      const workspaceId = this.extractWorkspaceId(request);
      const [objectMetadataItems, objectMetadataItem] =
        await this.getObjectMetadata(request, workspaceId);
      return await axios.post(
        `${request.protocol}://${request.headers.host}/graphql`,
        {
          query: await this.computeQuery(
            objectMetadataItems,
            objectMetadataItem,
            this.computeDepth(request),
          ),
          variables: this.computeVariables(request, objectMetadataItem),
        },
        {
          headers: {
            authorization: request.headers.authorization,
          },
        },
      );
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }
}
