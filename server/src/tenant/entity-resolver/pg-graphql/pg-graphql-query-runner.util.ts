import { BadRequestException } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { parseResult } from 'src/tenant/entity-resolver/utils/parse-result.util';

import { PGGraphQLQueryBuilder } from './pg-graphql-query-builder.util';

interface QueryRunnerOptions {
  tableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fields: FieldMetadata[];
}

export class PGGraphQLQueryRunner {
  private queryBuilder: PGGraphQLQueryBuilder;
  private options: QueryRunnerOptions;

  constructor(
    private dataSourceService: DataSourceService,
    options: QueryRunnerOptions,
  ) {
    this.queryBuilder = new PGGraphQLQueryBuilder({
      tableName: options.tableName,
      info: options.info,
      fields: options.fields,
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

  private parseResult(graphqlResult: any, command: string): any {
    const tableName = this.options.tableName;
    const entityKey = `${command}${tableName}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return parseResult(result);
  }

  async findMany(): Promise<any[]> {
    const query = this.queryBuilder.findMany();
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult(result, '');
  }

  async findOne(args: { id: string }): Promise<any> {
    const query = this.queryBuilder.findOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult(result, '');
  }

  async createMany(args: { data: any[] }): Promise<any[]> {
    const query = this.queryBuilder.createMany(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult(result, 'insertInto')?.records;
  }

  async createOne(args: { data: any }): Promise<any> {
    const records = await this.createMany({ data: [args.data] });

    return records?.[0];
  }

  async updateOne(args: { id: string; data: any }): Promise<any> {
    const query = this.queryBuilder.updateOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult(result, 'update')?.records?.[0];
  }
}
