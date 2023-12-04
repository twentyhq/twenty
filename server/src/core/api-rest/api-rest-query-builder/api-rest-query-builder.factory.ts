import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { DeleteQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-query.factory';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { CreateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-query.factory';
import { UpdateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/get-variables.factory';

const ALLOWED_DEPTH_VALUES = [1, 2];

@Injectable()
export class ApiRestQueryBuilderFactory {
  constructor(
    private readonly deleteQueryFactory: DeleteQueryFactory,
    private readonly createQueryFactory: CreateQueryFactory,
    private readonly updateQueryFactory: UpdateQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly deleteVariablesFactory: DeleteVariablesFactory,
    private readonly createVariablesFactory: CreateVariablesFactory,
    private readonly updateVariablesFactory: UpdateVariablesFactory,
    private readonly getVariablesFactory: GetVariablesFactory,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tokenService: TokenService,
  ) {}

  async getObjectMetadata(request: Request) {
    const workspaceId = await this.tokenService.verifyApiKeyToken(request);
    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId);
    const parsedObject = this.parsePath(request).object;
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

  parsePath(request: Request): { object: string; id?: string } {
    const queryAction = request.path.replace('/rest/', '').split('/');
    if (queryAction.length > 2) {
      throw Error(
        `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies`,
      );
    }
    if (queryAction.length === 1) {
      return { object: queryAction[0] };
    }
    return { object: queryAction[0], id: queryAction[1] };
  }

  computeDepth(request: Request) {
    const depth =
      typeof request.query?.depth === 'string'
        ? parseInt(request.query.depth)
        : undefined;
    if (depth !== undefined && !ALLOWED_DEPTH_VALUES.includes(depth)) {
      throw Error(
        `'depth=${depth}' parameter invalid. Allowed values are ${ALLOWED_DEPTH_VALUES.join(
          ', ',
        )}`,
      );
    }
    return depth;
  }

  async delete(request: Request) {
    const objectMetadata = await this.getObjectMetadata(request);
    const id = this.parsePath(request).id;
    if (!id) {
      throw Error(
        `delete ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }
    return {
      query: this.deleteQueryFactory.create(objectMetadata.objectMetadataItem),
      variables: this.deleteVariablesFactory.create(id),
    };
  }

  async create(request) {
    const objectMetadata = await this.getObjectMetadata(request);
    const depth = this.computeDepth(request);
    return {
      query: this.createQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async update(request) {
    const objectMetadata = await this.getObjectMetadata(request);
    const depth = this.computeDepth(request);
    const id = this.parsePath(request).id;
    if (!id) {
      throw Error(
        `update ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }
    return {
      query: this.updateQueryFactory.create(objectMetadata, depth),
      variables: this.updateVariablesFactory.create(id, request),
    };
  }

  async get(request) {
    const objectMetadata = await this.getObjectMetadata(request);
    const depth = this.computeDepth(request);
    const id = this.parsePath(request).id;
    return {
      query: id
        ? this.findOneQueryFactory.create(objectMetadata, depth)
        : this.findManyQueryFactory.create(objectMetadata, depth),
      variables: this.getVariablesFactory.create(id, request, objectMetadata),
    };
  }
}
