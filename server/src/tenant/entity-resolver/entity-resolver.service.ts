import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { pascalCase } from 'src/utils/pascal-case';

import { convertFieldsToGraphQL } from './entity-resolver.util';

function stringify(obj: any) {
  const jsonString = JSON.stringify(obj);
  const jsonWithoutQuotes = jsonString.replace(/"(\w+)"\s*:/g, '$1:');
  return jsonWithoutQuotes;
}

@Injectable()
export class EntityResolverService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async findAll(
    entityName: string,
    tableName: string,
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

    /* TODO: This is a temporary solution to set the schema before each raw query.
      getSchemaName is used to avoid a call to metadata.data_source table,
      this won't work when we won't be able to dynamically recompute the schema name from its workspace_id only (remote schemas for example)
    */
    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        {
          findAll${pascalCase(entityName)}: ${tableName}Collection {
            ${graphqlQuery}
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`findAll${pascalCase(entityName)}`];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  async findOne(
    entityName: string,
    tableName: string,
    args: { id: string },
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        {
          findOne${pascalCase(
            entityName,
          )}: ${tableName}Collection(filter: { id: { eq: "${args.id}" } }) {
            ${graphqlQuery}
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`findOne${pascalCase(entityName)}`];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  async createOne(
    entityName: string,
    tableName: string,
    args: { data: any },
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
          mutation {
            createOne${pascalCase(
              entityName,
            )}: insertInto${tableName}Collection(objects: [${stringify({
      id: uuidv4(),
      ...args.data,
    })}]) {
              affectedCount
              records {
                ${graphqlQuery}
              }
            }
          }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`createOne${pascalCase(entityName)}`]
        ?.records[0];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  async createMany(
    entityName: string,
    tableName: string,
    args: { data: any[] },
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        mutation {
          insertInto${entityName}Collection: insertInto${tableName}Collection(objects: ${stringify(
      args.data.map((datum) => ({
        id: uuidv4(),
        ...datum,
      })),
    )}) {
            affectedCount
            records {
              ${graphqlQuery}
            }
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`insertInto${entityName}Collection`]
        ?.records;

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  async updateOne(
    entityName: string,
    tableName: string,
    args: { id: string; data: any },
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    if (!this.environmentService.isFlexibleBackendEnabled()) {
      throw new ForbiddenException();
    }

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);
    const graphqlResult = await workspaceDataSource?.query(`
      SELECT graphql.resolve($$
          mutation {
            updateOne${pascalCase(
              entityName,
            )}: update${tableName}Collection(set: ${stringify(
      args.data,
    )}, filter: { id: { eq: "${args.id}" } }) {
              affectedCount
              records {
                ${graphqlQuery}
              }
            }
          }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`updateOne${pascalCase(entityName)}`]
        ?.records[0];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  private async prepareGrapQLQuery(
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ): Promise<string> {
    // Extract requested fields from GraphQL resolve info
    const fields = graphqlFields(info);

    await this.dataSourceService.createWorkspaceSchema(workspaceId);

    const graphqlQuery = convertFieldsToGraphQL(fields, fieldAliases);

    return graphqlQuery;
  }
}
