import { BadRequestException } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/tenant/resolver-builder/interfaces/record.interface';
import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from 'src/tenant/resolver-builder/interfaces/pg-graphql.interface';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { parseResult } from 'src/tenant/resolver-builder/utils/parse-result.util';

import { PGGraphQLQueryBuilder } from './pg-graphql-query-builder';

interface QueryRunnerOptions {
  targetTableName: string;
  workspaceId: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}

export class PGGraphQLQueryRunner<
  Record extends IRecord = IRecord,
  Filter extends RecordFilter = RecordFilter,
  OrderBy extends RecordOrderBy = RecordOrderBy,
> {
  private queryBuilder: PGGraphQLQueryBuilder;
  private options: QueryRunnerOptions;

  constructor(
    private dataSourceService: DataSourceService,
    options: QueryRunnerOptions,
  ) {
    this.queryBuilder = new PGGraphQLQueryBuilder({
      targetTableName: options.targetTableName,
      info: options.info,
      fieldMetadataCollection: options.fieldMetadataCollection,
    });
    this.options = options;
  }

  private async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    await workspaceDataSource?.query(`
      SET search_path TO ${this.dataSourceService.getSchemaName(workspaceId)};
    `);

    return workspaceDataSource?.query<PGGraphQLResult>(`
      SELECT graphql.resolve($$
        ${query}
      $$);
    `);
  }

  private parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    command: string,
  ): Result {
    const tableName = this.options.targetTableName;
    const entityKey = `${command}${tableName}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return parseResult(result);
  }

  async findMany(
    args: FindManyResolverArgs<Filter, OrderBy>,
  ): Promise<IConnection<Record> | undefined> {
    const query = this.queryBuilder.findMany(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult<IConnection<Record>>(result, '');
  }

  async findOne(
    args: FindOneResolverArgs<Filter>,
  ): Promise<Record | undefined> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new BadRequestException('Missing filter argument');
    }

    const query = this.queryBuilder.findOne(args);
    const result = await this.execute(query, this.options.workspaceId);
    const parsedResult = this.parseResult<IConnection<Record>>(result, '');

    return parsedResult?.edges?.[0]?.node;
  }

  async createMany(
    args: CreateManyResolverArgs<Record>,
  ): Promise<Record[] | undefined> {
    const query = this.queryBuilder.createMany(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'insertInto')
      ?.records;
  }

  async createOne(
    args: CreateOneResolverArgs<Record>,
  ): Promise<Record | undefined> {
    const records = await this.createMany({ data: [args.data] });

    return records?.[0];
  }

  async updateOne(
    args: UpdateOneResolverArgs<Record>,
  ): Promise<Record | undefined> {
    const query = this.queryBuilder.updateOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'update')
      ?.records?.[0];
  }

  async deleteOne(args: DeleteOneResolverArgs): Promise<Record | undefined> {
    const query = this.queryBuilder.deleteOne(args);
    const result = await this.execute(query, this.options.workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'deleteFrom')
      ?.records?.[0];
  }
}
