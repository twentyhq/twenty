import { BadRequestException, Injectable } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import { DataSourceService } from 'src/tenant/metadata/data-source/data-source.service';

import { convertFieldsToGraphQL } from './entity-resolver.util';

@Injectable()
export class EntityResolverService {
  constructor(private readonly dataSourceService: DataSourceService) {}
  async findAll(
    entityName: string,
    tableName: string,
    workspaceId: string,
    info: GraphQLResolveInfo,
    fieldAliases: Record<string, string>,
  ) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

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
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    const graphqlQuery = await this.prepareGrapQLQuery(
      workspaceId,
      info,
      fieldAliases,
    );

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
