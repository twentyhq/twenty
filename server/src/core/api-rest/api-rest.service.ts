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
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/utils/map-field-metadata-to-graphql-query.utils';

enum FILTER_COMPARATORS {
  eq = 'eq',
  neq = 'neq',
  in = 'in',
  is = 'is',
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  startsWith = 'startsWith',
  like = 'like',
  ilike = 'ilike',
}
const ALLOWED_DEPTH_VALUES = [1, 2];
const DEFAULT_ORDER_DIRECTION = OrderByDirection.AscNullsFirst;
enum CONJUNCTIONS {
  or = 'or',
  and = 'and',
  not = 'not',
}
const DEFAULT_FILTER_CONJUNCTION = CONJUNCTIONS.and;

@Injectable()
export class ApiRestService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly environmentService: EnvironmentService,
  ) {}

  computeDeleteQuery(objectMetadataItem) {
    return `
      mutation Delete${capitalize(objectMetadataItem.nameSingular)}($id: ID!) {
        delete${capitalize(objectMetadataItem.nameSingular)}(id: $id) {
          id
        }
      }
    `;
  }

  computeCreateQuery(objectMetadataItems, objectMetadataItem, depth?) {
    return `
      mutation Create${capitalize(
        objectMetadataItem.nameSingular,
      )}($data: CompanyCreateInput!) {
        create${capitalize(objectMetadataItem.nameSingular)}(data: $data) {
          id
          ${objectMetadataItem.fields
            .map((field) =>
              mapFieldMetadataToGraphqlQuery(objectMetadataItems, field, depth),
            )
            .join('\n')}
        }
      }
    `;
  }

  computeUpdateQuery(objectMetadataItems, objectMetadataItem, depth?) {
    return `
      mutation Update${capitalize(
        objectMetadataItem.nameSingular,
      )}($id: ID!, $data: CompanyUpdateInput!) {
        update${capitalize(
          objectMetadataItem.nameSingular,
        )}(id: $id, data: $data) {
          id
          ${objectMetadataItem.fields
            .map((field) =>
              mapFieldMetadataToGraphqlQuery(objectMetadataItems, field, depth),
            )
            .join('\n')}
        }
      }
    `;
  }

  computeFindOneQuery(objectMetadataItems, objectMetadataItem, depth?) {
    return `
      query FindOne${capitalize(objectMetadataItem.nameSingular)}(
        $filter: ${capitalize(objectMetadataItem.nameSingular)}FilterInput!,
        ) {
        ${objectMetadataItem.nameSingular}(filter: $filter) {
          id
          ${objectMetadataItem.fields
            .map((field) =>
              mapFieldMetadataToGraphqlQuery(objectMetadataItems, field, depth),
            )
            .join('\n')}
        }
      }
    `;
  }

  computeFindManyQuery(
    objectMetadataItems,
    objectMetadataItem,
    depth?,
  ): string {
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
                  mapFieldMetadataToGraphqlQuery(
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

  async getObjectMetadata(request: Request) {
    const workspaceId = this.extractWorkspaceId(request);
    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);
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
    return {
      objectMetadataItems,
      objectMetadataItem: objectMetadata,
    };
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

  parseFilterQueryContent(filterQuery) {
    let bracketsCounter = 0;
    let parenthesisCounter = 0;
    const predicates: string[] = [];
    let currentPredicates = '';
    for (const c of filterQuery) {
      if (c === '(') {
        parenthesisCounter++;
        if (parenthesisCounter === 1) continue;
      }
      if (c === ')') {
        parenthesisCounter--;
        if (parenthesisCounter === 0) continue;
      }
      if (c === '[') {
        bracketsCounter++;
      }
      if (c === ']') {
        bracketsCounter--;
      }
      if (c === ',' && parenthesisCounter === 1 && bracketsCounter === 0) {
        predicates.push(currentPredicates);
        currentPredicates = '';
        continue;
      }
      if (parenthesisCounter >= 1) currentPredicates += c;
    }
    if (currentPredicates.length) {
      predicates.push(currentPredicates);
    }
    return predicates;
  }

  parseStringFilter(filterQuery, objectMetadataItem) {
    const result = {};
    const match = filterQuery.match(
      `^(${Object.values(CONJUNCTIONS).join('|')})((.+))$`,
    );
    if (match) {
      const conjunction = match[1];
      const subResult = this.parseFilterQueryContent(filterQuery).map((elem) =>
        this.parseStringFilter(elem, objectMetadataItem),
      );
      if (conjunction === CONJUNCTIONS.not) {
        if (subResult.length > 1) {
          throw Error(
            `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
          );
        }
        result[conjunction] = subResult[0];
      } else {
        result[conjunction] = subResult;
      }
      return result;
    }
    return this.parseSimpleFilter(filterQuery, objectMetadataItem);
  }

  parseSimpleFilterString(filterString: string): {
    fields: string[];
    comparator: string;
    value: string;
  } {
    if (
      !filterString.match(
        `^(.+)\\[(${Object.keys(FILTER_COMPARATORS).join('|')})\\]:(.+)$`,
      )
    ) {
      throw Error(`'filter' invalid for '${filterString}'. eg: price[gte]:10`);
    }
    let fields = '';
    let comparator = '';
    let value = '';
    let previousC = '';
    let fillFields = true;
    let fillComparator = false;
    let fillValue = false;
    for (const c of filterString) {
      if (c === '[') {
        fillFields = false;
      }
      if (previousC === '[' && !comparator.length) {
        fillComparator = true;
      }
      if (c === ']') {
        fillComparator = false;
      }
      if (previousC === ']' && c === ':' && !value.length) {
        fillValue = true;
        continue;
      }
      if (fillFields) {
        fields += c;
      }
      if (fillComparator) {
        comparator += c;
      }
      if (fillValue) {
        value += c;
      }
      previousC = c;
    }
    if (!Object.keys(FILTER_COMPARATORS).includes(comparator)) {
      throw Error(
        `'filter' invalid for '${filterString}', comparator ${comparator} not in ${Object.keys(
          FILTER_COMPARATORS,
        ).join(',')}`,
      );
    }
    return { fields: fields.split('.'), comparator, value };
  }

  parseSimpleFilter(filterString: string, objectMetadataItem) {
    // price[lte]:100
    const { fields, comparator, value } =
      this.parseSimpleFilterString(filterString);
    this.checkFields(objectMetadataItem, fields, 'filter');
    const fieldType = this.getFieldType(objectMetadataItem, fields[0]);
    const formattedValue = this.formatFieldValue(value, fieldType, comparator);
    return fields.reverse().reduce(
      (acc, currentValue) => {
        return { [currentValue]: acc };
      },
      { [comparator]: formattedValue },
    );
  }

  formatFieldValue(value, fieldType?, comparator?) {
    if (comparator === 'in') {
      if (value[0] !== '[' || value[value.length - 1] !== ']') {
        throw Error(
          `'filter' invalid for 'in' operator. Received '${value}' but array value expected eg: 'field[in]:[value_1,value_2]'`,
        );
      }
      const stringValues = value.substring(1, value.length - 1);
      return stringValues
        .split(',')
        .map((value) => this.formatFieldValue(value, fieldType));
    }
    if (comparator === 'is') {
      return value;
    }
    if (fieldType === 'NUMBER') {
      return parseInt(value);
    }
    if (fieldType === 'BOOLEAN') {
      return value.toLowerCase() === 'true';
    }
    if (
      (value[0] === '"' || value[0] === "'") &&
      (value.charAt(value.length - 1) === '"' ||
        value.charAt(value.length - 1) === "'")
    ) {
      return value.substring(1, value.length - 1);
    }
    return value;
  }

  parseFilter(request, objectMetadataItem) {
    const parsedObjectId = this.parseObject(request)[1];
    if (parsedObjectId) {
      return { id: { eq: parsedObjectId } };
    }
    const rawFilterQuery = request.query.filter
      ?.replaceAll('%22', '"')
      ?.replaceAll('%27', "'");
    if (typeof rawFilterQuery !== 'string') {
      return {};
    }
    this.checkFilterQuery(rawFilterQuery);
    const filterQuery = this.addDefaultConjunctionIfMissing(rawFilterQuery);
    return this.parseStringFilter(filterQuery, objectMetadataItem);
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

  checkFields(objectMetadataItem, fieldNames, queryParam) {
    for (const fieldName of fieldNames) {
      if (
        !objectMetadataItem.fields
          .reduce(
            (acc, itemField) => [
              ...acc,
              itemField.name,
              ...Object.keys(itemField.targetColumnMap),
            ],
            [],
          )
          .includes(fieldName)
      ) {
        throw Error(
          `'${queryParam}' field '${fieldName}' does not exist in '${objectMetadataItem.targetTableName}' object`,
        );
      }
    }
  }

  getFieldType(objectMetadataItem, fieldName) {
    for (const itemField of objectMetadataItem.fields) {
      if (fieldName === itemField.name) {
        return itemField.type;
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

  computeQueryVariables(request: Request, objectMetadataItem) {
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

  computeDepth(request): number | undefined {
    const depth =
      typeof request.query.depth === 'string'
        ? parseInt(request.query.depth)
        : undefined;
    if (depth && !ALLOWED_DEPTH_VALUES.includes(depth)) {
      throw Error(
        `'depth=${depth}' parameter invalid. Allowed values are ${ALLOWED_DEPTH_VALUES.join(
          ', ',
        )}`,
      );
    }
    return depth;
  }

  async callGraphql(request: Request, data) {
    return await axios.post(
      `${this.environmentService.getLocalServerUrl()}/graphql`,
      data,
      {
        headers: {
          Authorization: request.headers.authorization,
        },
      },
    );
  }

  async get(request: Request) {
    try {
      const objectMetadata = await this.getObjectMetadata(request);
      const id = this.parseObject(request)[1];
      const depth = this.computeDepth(request);
      const data = {
        query: id
          ? this.computeFindOneQuery(
              objectMetadata.objectMetadataItems,
              objectMetadata.objectMetadataItem,
              depth,
            )
          : this.computeFindManyQuery(
              objectMetadata.objectMetadataItems,
              objectMetadata.objectMetadataItem,
              depth,
            ),
        variables: id
          ? { filter: { id: { eq: id } } }
          : this.computeQueryVariables(
              request,
              objectMetadata.objectMetadataItem,
            ),
      };
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async delete(request: Request) {
    try {
      const objectMetadata = await this.getObjectMetadata(request);
      const id = this.parseObject(request)[1];
      if (!id) {
        return {
          data: {
            error: `delete ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
          },
        };
      }
      const data = {
        query: this.computeDeleteQuery(objectMetadata.objectMetadataItem),
        variables: {
          id: this.parseObject(request)[1],
        },
      };
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async create(request: Request) {
    try {
      const objectMetadata = await this.getObjectMetadata(request);
      const depth = this.computeDepth(request);
      const data = {
        query: this.computeCreateQuery(
          objectMetadata.objectMetadataItems,
          objectMetadata.objectMetadataItem,
          depth,
        ),
        variables: {
          data: request.body,
        },
      };
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }

  async update(request: Request) {
    try {
      const objectMetadata = await this.getObjectMetadata(request);
      const depth = this.computeDepth(request);
      const id = this.parseObject(request)[1];
      if (!id) {
        return {
          data: {
            error: `update ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
          },
        };
      }
      const data = {
        query: this.computeUpdateQuery(
          objectMetadata.objectMetadataItems,
          objectMetadata.objectMetadataItem,
          depth,
        ),
        variables: {
          id: this.parseObject(request)[1],
          data: request.body,
        },
      };
      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: `${err}` } };
    }
  }
}
