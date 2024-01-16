import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteManyResolverArgs,
  DeleteOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceQueryBuilderFactory } from 'src/workspace/workspace-query-builder/workspace-query-builder.factory';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import {
  CallWebhookJobsJob,
  CallWebhookJobsJobData,
  CallWebhookJobsJobOperation,
} from 'src/workspace/workspace-query-runner/jobs/call-webhook-jobs.job';
import { parseResult } from 'src/workspace/workspace-query-runner/utils/parse-result.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/filters/utils/global-exception-handler.util';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';

import { WorkspaceQueryRunnerOptions } from './interfaces/query-runner-optionts.interface';
import {
  PGGraphQLMutation,
  PGGraphQLResult,
} from './interfaces/pg-graphql.interface';

@Injectable()
export class WorkspaceQueryRunnerService {
  private readonly logger = new Logger(WorkspaceQueryRunnerService.name);

  constructor(
    private readonly workspaceQueryBuilderFactory: WorkspaceQueryBuilderFactory,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @Inject(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async findMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<Record> | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const start = performance.now();

      const query = await this.workspaceQueryBuilderFactory.findMany(
        args,
        options,
      );

      const result = await this.execute(query, workspaceId);
      const end = performance.now();

      console.log(
        `query time: ${end - start} ms on query ${
          options.objectMetadataItem.nameSingular
        }`,
      );

      return this.parseResult<IConnection<Record>>(
        result,
        objectMetadataItem,
        '',
      );
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async findOne<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: FindOneResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    try {
      if (!args.filter || Object.keys(args.filter).length === 0) {
        throw new BadRequestException('Missing filter argument');
      }
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.findOne(
        args,
        options,
      );
      const result = await this.execute(query, workspaceId);
      const parsedResult = this.parseResult<IConnection<Record>>(
        result,
        objectMetadataItem,
        '',
      );

      return parsedResult?.edges?.[0]?.node;
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.createMany(
        args,
        options,
      );

      const result = await this.execute(query, workspaceId);

      const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'insertInto',
      )?.records;

      await this.triggerWebhooks<Record>(
        parsedResults,
        CallWebhookJobsJobOperation.create,
        options,
      );

      return parsedResults;
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async createOne<Record extends IRecord = IRecord>(
    args: CreateOneResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    const results = await this.createMany({ data: [args.data] }, options);

    return results?.[0];
  }

  async updateOne<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.updateOne(
        args,
        options,
      );
      const result = await this.execute(query, workspaceId);

      const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
      )?.records;

      await this.triggerWebhooks<Record>(
        parsedResults,
        CallWebhookJobsJobOperation.update,
        options,
      );

      return parsedResults?.[0];
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async deleteOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.deleteOne(
        args,
        options,
      );
      const result = await this.execute(query, workspaceId);

      const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'deleteFrom',
      )?.records;

      await this.triggerWebhooks<Record>(
        parsedResults,
        CallWebhookJobsJobOperation.delete,
        options,
      );

      return parsedResults?.[0];
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async updateMany<Record extends IRecord = IRecord>(
    args: UpdateManyResolverArgs<Record>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.updateMany(
        args,
        options,
      );
      const result = await this.execute(query, workspaceId);

      const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'update',
      )?.records;

      await this.triggerWebhooks<Record>(
        parsedResults,
        CallWebhookJobsJobOperation.update,
        options,
      );

      return parsedResults;
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async deleteMany<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: DeleteManyResolverArgs<Filter>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record[] | undefined> {
    try {
      const { workspaceId, objectMetadataItem } = options;
      const query = await this.workspaceQueryBuilderFactory.deleteMany(
        args,
        options,
      );
      const result = await this.execute(query, workspaceId);

      const parsedResults = this.parseResult<PGGraphQLMutation<Record>>(
        result,
        objectMetadataItem,
        'deleteFrom',
      )?.records;

      await this.triggerWebhooks<Record>(
        parsedResults,
        CallWebhookJobsJobOperation.delete,
        options,
      );

      return parsedResults;
    } catch (exception) {
      const error = handleExceptionAndConvertToGraphQLError(
        exception,
        this.exceptionHandlerService,
      );

      return Promise.reject(error);
    }
  }

  async execute(
    query: string,
    workspaceId: string,
  ): Promise<PGGraphQLResult | undefined> {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource?.query(`
      SET search_path TO ${this.workspaceDataSourceService.getSchemaName(
        workspaceId,
      )};
    `);

    const results = await workspaceDataSource?.query<PGGraphQLResult>(`
      SELECT graphql.resolve($$
        ${query}
      $$);
    `);

    return results;
  }

  private parseResult<Result>(
    graphqlResult: PGGraphQLResult | undefined,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
  ): Result {
    const entityKey = `${command}${computeObjectTargetTable(
      objectMetadataItem,
    )}Collection`;
    const result = graphqlResult?.[0]?.resolve?.data?.[entityKey];
    const errors = graphqlResult?.[0]?.resolve?.errors;

    if (!result) {
      throw new InternalServerErrorException(
        `GraphQL errors on ${command}${
          objectMetadataItem.nameSingular
        }: ${JSON.stringify(errors)}`,
      );
    }

    return parseResult(result);
  }

  async executeAndParse<Result>(
    query: string,
    objectMetadataItem: ObjectMetadataInterface,
    command: string,
    workspaceId: string,
  ): Promise<Result> {
    const result = await this.execute(query, workspaceId);

    return this.parseResult(result, objectMetadataItem, command);
  }

  async triggerWebhooks<Record>(
    jobsData: Record[] | undefined,
    operation: CallWebhookJobsJobOperation,
    options: WorkspaceQueryRunnerOptions,
  ) {
    if (!Array.isArray(jobsData)) {
      return;
    }
    jobsData.forEach((jobData) => {
      this.messageQueueService.add<CallWebhookJobsJobData>(
        CallWebhookJobsJob.name,
        {
          record: jobData,
          workspaceId: options.workspaceId,
          operation,
          objectMetadataItem: options.objectMetadataItem,
        },
        { retryLimit: 3 },
      );
    });
  }
}
