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
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { parseResult } from 'src/tenant/query-runner/utils/parse-result.util';

import { QueryRunnerOptions } from './interfaces/query-runner-optionts.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';

@Injectable()
export class QueryRunnerService {
  private readonly logger = new Logger(QueryRunnerService.name);
  private queryRunnerOptions: QueryRunnerOptions;

  constructor(
    private readonly queryBuilderFactory: QueryBuilderFactory,
    private readonly dataSourceService: DataSourceService,
  ) {}

  init(options: QueryRunnerOptions): this {
    this.queryBuilderFactory.create(options);
    this.queryRunnerOptions = options;
    return this;
  }

  async findMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
  ): Promise<IConnection<Record> | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    const { workspaceId } = this.queryRunnerOptions;
    const query = this.queryBuilderFactory.findMany(args);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<IConnection<Record>>(result, '');
  }

  async findOne<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(args: FindOneResolverArgs<Filter>): Promise<Record | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new BadRequestException('Missing filter argument');
    }
    const { workspaceId } = this.queryRunnerOptions;
    const query = this.queryBuilderFactory.findOne(args);
    const result = await this.execute(query, workspaceId);
    const parsedResult = this.parseResult<IConnection<Record>>(result, '');

    return parsedResult?.edges?.[0]?.node;
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
  ): Promise<Record[] | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    const { workspaceId } = this.queryRunnerOptions;
    const query = this.queryBuilderFactory.createMany(args);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'insertInto')
      ?.records;
  }

  async createOne<Record extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Record>,
  ): Promise<Record | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    const records = await this.createMany({ data: [args.data] });

    return records?.[0];
  }

  async updateOne<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
  ): Promise<Record | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    const { workspaceId } = this.queryRunnerOptions;
    const query = this.queryBuilderFactory.updateOne(args);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'update')
      ?.records?.[0];
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
  ): Promise<Record | undefined> {
    if (!this.queryRunnerOptions) {
      throw new Error(
        'Query runner need to be initialized first, please call init method',
      );
    }
    const { workspaceId } = this.queryRunnerOptions;
    const query = this.queryBuilderFactory.deleteOne(args);
    const result = await this.execute(query, workspaceId);

    return this.parseResult<PGGraphQLMutation<Record>>(result, 'deleteFrom')
      ?.records?.[0];
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
    const { targetTableName } = this.queryRunnerOptions;
    const entityKey = `${command}${targetTableName}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];

    if (!result) {
      throw new BadRequestException('Malformed result from GraphQL query');
    }

    return parseResult(result);
  }
}
