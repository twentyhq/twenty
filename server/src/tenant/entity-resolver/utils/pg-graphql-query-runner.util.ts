import { BadRequestException } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { pascalCase } from 'src/utils/pascal-case';

import { PGGraphQLQueryBuilder } from './pg-graphql-query-builder.util';

interface QueryRunnerOptions {
  entityName: string;
  tableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fieldAliases: Record<string, string>;
}

export class PGGraphQLQueryRunner {
  private queryBuilder: PGGraphQLQueryBuilder;
  private options: QueryRunnerOptions;

  constructor(
    private dataSourceService: DataSourceService,
    options: QueryRunnerOptions,
  ) {
    this.queryBuilder = new PGGraphQLQueryBuilder({
      entityName: options.entityName,
      tableName: options.tableName,
      info: options.info,
      fieldAliases: options.fieldAliases,
    });
    this.options = options;
  }

  private async execute(query: string, workspaceId: string): Promise<any> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);

    return workspaceDataSource?.query(`
      SELECT graphql.resolve($$
        ${query}
      $$);
    `);
  }

  private parseResults(graphqlResult: any, command: string): any {
    const entityKey = `${command}${pascalCase(this.options.entityName)}`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return result;
  }

  async findMany(): Promise<any[]> {
    const query = this.queryBuilder.findMany().build();
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'findMany');
  }

  async findOne(args: { id: string }): Promise<any> {
    const query = this.queryBuilder.findOne(args).build();
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'findOne');
  }

  async createMany(args: { data: any[] }): Promise<any[]> {
    const query = this.queryBuilder.createMany(args).build();
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'createMany')?.records;
  }

  async createOne(args: { data: any }): Promise<any> {
    const records = await this.createMany({ data: [args.data] });

    return records?.[0];
  }

  async updateOne(args: { id: string; data: any }): Promise<any> {
    const query = this.queryBuilder.updateOne(args).build();
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResults(result, 'updateOne')?.records?.[0];
  }
}
