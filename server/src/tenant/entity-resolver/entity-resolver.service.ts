import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { convertFieldsToGraphQL } from './entity-resolver.util';

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
          ${entityName}Collection: ${tableName}Collection {
            ${graphqlQuery}
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`${entityName}Collection`];

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
          ${entityName}Collection: : ${tableName}Collection(filter: { id: { eq: "${args.id}" } }) {
            ${graphqlQuery}
          }
        }
      $$);
    `);

    const result =
      graphqlResult?.[0]?.resolve?.data?.[`${entityName}Collection`];

    if (!result) {
      return null;
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
