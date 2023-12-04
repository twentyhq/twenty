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
import {
  addDefaultConjunctionIfMissing,
  checkFilterQuery,
  parseStringFilter,
} from 'src/core/api-rest/utils/filter-query.utils';
import { checkFields } from 'src/core/api-rest/utils/metadata-query.utils';

const ALLOWED_DEPTH_VALUES = [1, 2];
const DEFAULT_ORDER_DIRECTION = OrderByDirection.AscNullsFirst;

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
    checkFilterQuery(rawFilterQuery);
    const filterQuery = addDefaultConjunctionIfMissing(rawFilterQuery);
    return parseStringFilter(filterQuery, objectMetadataItem);
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
    checkFields(objectMetadataItem, Object.keys(result));
    return <RecordOrderBy>result;
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
