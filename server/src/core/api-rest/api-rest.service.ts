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
const DEFAULT_ORDER_DIRECTION = OrderByDirection.AscNullsFirst;
const DEFAULT_FILTER_CONJUNCTION = 'and';
const MAX_CONJUNCTION_ENCAPSULATION = 102;

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
    const [objectMetadata] = objectMetadataItems.filter(
      (object) => object.namePlural === parsedObject,
    );
    if (!objectMetadata) {
      const [wrongObjectMetadata] = objectMetadataItems.filter(
        (object) => object.nameSingular === parsedObject,
      );
      let hint = 'eg: companies';
      if (wrongObjectMetadata) {
        hint = `Did you mean '${wrongObjectMetadata.namePlural}'?`;
      }
      throw Error(`object '${parsedObject}' not found. ${hint}`);
    }
    return [objectMetadataItems, objectMetadata];
  }

  extractDeepestFilterQuery(filterQuery) {
    const match = filterQuery.match(/\(([^()]*)\)/);
    if (match) {
      const matchRegex = match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return filterQuery.match(`(or|and|not)\\(${matchRegex}\\)`)[0];
    }
  }

  computeStringFilterBlocks(filterQuery) {
    const stringFilterBlocks: string[] = [];
    let remainingFilterQuery = filterQuery;
    let deepestFilterQuery = filterQuery;
    let securityCount = MAX_CONJUNCTION_ENCAPSULATION; // Avoids indefinite loop if wrong filterQuery
    while (deepestFilterQuery && securityCount > 0) {
      deepestFilterQuery = this.extractDeepestFilterQuery(remainingFilterQuery);
      remainingFilterQuery = remainingFilterQuery
        .replace(deepestFilterQuery, '')
        .replace(',,', ',')
        .replace('(,', '(')
        .replace(',)', ')');
      if (deepestFilterQuery) {
        stringFilterBlocks.push(deepestFilterQuery);
      }
      securityCount--;
    }
    if (securityCount === 0) {
      throw Error(
        `'filter' invalid. Maximum of ${
          MAX_CONJUNCTION_ENCAPSULATION - 2
        } (or|and|not) encapsulations reached`,
      );
    }
    return stringFilterBlocks;
  }

  mergeFilterBlocks(filterBlocks) {
    return filterBlocks.reduce((acc, filterBlock) => {
      if (!acc) {
        return filterBlock;
      } else {
        filterBlock[Object.keys(filterBlock)[0]].push(acc);
        return filterBlock;
      }
    });
  }

  addDefaultConjunctionIfMissing(filterQuery) {
    if (!(filterQuery.includes('(') && filterQuery.includes(')'))) {
      return `${DEFAULT_FILTER_CONJUNCTION}(${filterQuery})`;
    }
    return filterQuery;
  }

  checkFilterQuery(filterQuery) {
    const countOpenedBrackets = (filterQuery.match(/\(/g) || []).length;
    const countClosedBrackets = (filterQuery.match(/\)/g) || []).length;
    const diff = countOpenedBrackets - countClosedBrackets;
    if (diff !== 0) {
      const hint =
        diff > 0
          ? `${diff} open bracket${diff > 1 ? 's are' : ' is'}`
          : `${Math.abs(diff)} close bracket${
              Math.abs(diff) > 1 ? 's are' : ' is'
            }`;
      throw Error(`'filter' invalid. ${hint} missing in the query`);
    }
    return;
  }

  parseFilter(request, objectMetadataItem) {
    const parsedObjectId = this.parseObject(request)[1];
    if (parsedObjectId) {
      return { id: { eq: parsedObjectId } };
    }
    const rawFilterQuery = request.query.filter;
    if (typeof rawFilterQuery !== 'string') {
      return {};
    }

    this.checkFilterQuery(rawFilterQuery);

    const filterQuery = this.addDefaultConjunctionIfMissing(rawFilterQuery);

    //filterQuery = or(and(type[lte]:1,or(type[lte]:2,updatedAt[eq]:3)),type[lte]:4)
    const stringFilterBlocks = this.computeStringFilterBlocks(filterQuery);

    // stringFilterBlocks = [
    //   'or(type[lte]:2,updatedAt[eq]:3)',
    //   'and(type[lte]:1)',
    //   'or(type[lte]:4)',
    // ]
    const filterBlocks = stringFilterBlocks.map((stringFilterBlock) =>
      this.parseFilterBlock(stringFilterBlock, objectMetadataItem),
    );

    // stringFilterBlocks = [
    //   { or: [{ type: { lte: '2' } }, { updatedAt: { eq: '3' } }] },
    //   { and: [{ type: { lte: '1' } }] },
    //   { or: [{ type: { lte: '4' } }] },
    // ]
    const result = this.mergeFilterBlocks(filterBlocks);

    // result = [
    //   { or: [
    //     { type: { lte: '4' } },
    //     { and: [
    //       { type: { lte: '1' } },
    //       { or: [
    //         { type: { lte: '2' } },
    //         { updatedAt: { eq: '3' }
    //       }]
    //     }]
    //   }]
    // }]
    return result;
  }

  //TODO:
  //- parse filter values with metadata field type
  //- handler nested filtering eg: filter=type.assignee.name.firstName[eq]:Charles
  //- support multiple conjunction on same level: and(not(field_1[eq]:1),or(field_2[eq]:2,field_3[eq]:3))
  //- add function docstrings

  parseFilterBlock(filterQuery, objectMetadataItem) {
    // and(price[lte]:100,price[lte]:100)
    const result = {};
    const parsedFilters = filterQuery.match(/^(or|and|not)\((.+)\)$/s);
    if (parsedFilters) {
      const conjunctionOperator = parsedFilters[1];
      const subFilterQuery = parsedFilters[2];
      if (conjunctionOperator === 'not') {
        if (subFilterQuery.split(',').length > 1) {
          throw Error(
            `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
          );
        }
        result[conjunctionOperator] = this.parseSimpleFilter(
          subFilterQuery,
          objectMetadataItem,
        );
      } else {
        result[conjunctionOperator] = subFilterQuery
          .split(',')
          .map((subQuery) =>
            this.parseSimpleFilter(subQuery, objectMetadataItem),
          );
      }
      return result;
    } else {
      return this.parseSimpleFilter(filterQuery, objectMetadataItem);
    }
  }

  parseSimpleFilter(filterString: string, objectMetadataItem) {
    // price[lte]:100
    if (
      !filterString.match(`^(.+)\\[(${FILTER_COMPARATORS.join('|')})\\]:(.+)$`)
    ) {
      throw Error(`'filter' invalid for '${filterString}'. eg: price[gte]:10`);
    }
    const [fieldAndComparator, value] = filterString.split(':');
    const [field, comparator] = fieldAndComparator.replace(']', '').split('[');
    if (!FILTER_COMPARATORS.includes(comparator)) {
      throw Error(
        `'filter' invalid for '${filterString}', comparator ${comparator} not in ${FILTER_COMPARATORS.join(
          ',',
        )}`,
      );
    }
    this.checkFields(objectMetadataItem, [field], 'filter');
    return { [field]: { [comparator]: value } };
  }

  parseOrderBy(request, objectMetadataItem) {
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
    this.checkFields(objectMetadataItem, Object.keys(result), 'order_by');
    return <RecordOrderBy>result;
  }

  checkFields(objectMetadataItem, fields, queryParam) {
    for (const field of fields) {
      if (
        !objectMetadataItem.fields.map((field) => field.name).includes(field)
      ) {
        throw Error(
          `'${queryParam}' field '${field}' does not exist in '${objectMetadataItem.targetTableName}' object`,
        );
      }
    }
  }

  parseLimit(request) {
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

  parseCursor(request) {
    const cursorQuery = request.query.last_cursor;
    if (typeof cursorQuery !== 'string') {
      return undefined;
    }
    return cursorQuery;
  }

  computeVariables(request: Request, objectMetadataItem) {
    return {
      filter: this.parseFilter(request, objectMetadataItem),
      orderBy: this.parseOrderBy(request, objectMetadataItem),
      limit: this.parseLimit(request),
      lastCursor: this.parseCursor(request),
    };
  }

  parseObject(request) {
    const queryAction = request.path.replace('/rest/', '').split('/');
    if (queryAction.length > 2) {
      throw Error(
        `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies`,
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
        `${this.environmentService.getInternalServerUrl()}/graphql`,
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
