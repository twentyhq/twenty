import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/tenant/query-builder/interfaces/record.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/tenant/query-builder/interfaces/resolvers-builder.interface';

import { QueryBuilderFactory } from 'src/tenant/query-builder/query-builder.factory';
import { parseResult } from 'src/tenant/query-runner/utils/parse-result.util';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';

import { QueryRunnerOptions } from './interfaces/query-runner-optionts.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';

@Injectable()
export class QueryRunnerService {
  private readonly logger = new Logger(QueryRunnerService.name);

  constructor(
    private readonly queryBuilderFactory: QueryBuilderFactory,
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  async findMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: QueryRunnerOptions,
  ): Promise<IConnection<Record> | undefined> {
    const { workspaceId, targetTableName } = options;
    const query = this.queryBuilderFactory.findMany(args, options);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<IConnection<Record>>(result, targetTableName, '');
  }

  async findOne<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: QueryRunnerOptions,
  ): Promise<Record | undefined> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new BadRequestException('Missing filter argument');
    }
    const { workspaceId, targetTableName } = options;
    const query = this.queryBuilderFactory.findOne(args, options);
    const result = await this.execute(query, workspaceId);
    const parsedResult = this.parseResult<IConnection<Record>>(
      result,
      targetTableName,
      '',
    );

    return parsedResult?.edges?.[0]?.node;
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
    options: QueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    const { workspaceId, targetTableName } = options;
    const query = this.queryBuilderFactory.createMany(args, options);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(
      result,
      targetTableName,
      'insertInto',
    )?.records;
  }

  async createOne<Record extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Record>,
    options: QueryRunnerOptions,
  ): Promise<Record | undefined> {
    const records = await this.createMany({ data: [args.data] }, options);

    return records?.[0];
  }

  async updateOne<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
    options: QueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, targetTableName } = options;

    console.log({
      workspaceId,
      targetTableName,
    });
    const query = this.queryBuilderFactory.updateOne(args, options);

    console.log({ query });

    const result = await this.execute(query, workspaceId);

    console.log('HEY');

    return this.parseResult<PGGraphQLMutation<Record>>(
      result,
      targetTableName,
      'update',
    )?.records?.[0];
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: QueryRunnerOptions,
  ): Promise<Record | undefined> {
    const { workspaceId, targetTableName } = options;
    const query = this.queryBuilderFactory.deleteOne(args, options);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(
      result,
      targetTableName,
      'deleteFrom',
    )?.records?.[0];
  }

  private async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.tenantDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.tenantDataSourceService.getSchemaName(
        workspaceId,
      )};
    `);

    const results = await workspaceDataSource?.query<PGGraphQLResult>(`
      SELECT graphql.resolve($$
        ${query}
      $$);
    `);

    console.log(
      JSON.stringify({
        results,
      }),
    );

    return results;
  }

  private parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    targetTableName: string,
    command: string,
  ): Result {
    const entityKey = `${command}${targetTableName}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];
    const errors = graphqlResult?.[0]?.resolve?.errors;

    console.log('Result : ', graphqlResult?.[0]?.resolve);

    if (Array.isArray(errors) && errors.length > 0) {
      console.error('GraphQL errors', errors);
    }

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return parseResult(result);
  }
}
