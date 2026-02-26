import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { IngestionFieldMappingService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-field-mapping.service';
import { IngestionLogService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-log.service';
import { IngestionPipelineService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-pipeline.service';
import { IngestionRecordProcessorService } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-record-processor.service';
import { type IngestionPullJobData } from 'src/engine/metadata-modules/ingestion-pipeline/services/ingestion-pull-scheduler.service';
import { IngestionPreprocessorRegistry } from 'src/engine/metadata-modules/ingestion-pipeline/preprocessors/ingestion-preprocessor.registry';
import { type SourceAuthConfig } from 'src/engine/metadata-modules/ingestion-pipeline/types/source-auth-config.type';
import { type SourceRequestConfig } from 'src/engine/metadata-modules/ingestion-pipeline/types/source-request-config.type';
import { type PaginationConfig } from 'src/engine/metadata-modules/ingestion-pipeline/types/pagination-config.type';
import { extractValueByPath } from 'src/engine/metadata-modules/ingestion-pipeline/utils/extract-value-by-path.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Processor(MessageQueue.ingestionQueue)
export class IngestionPullJob {
  private readonly logger = new Logger(IngestionPullJob.name);

  constructor(
    private readonly pipelineService: IngestionPipelineService,
    private readonly fieldMappingService: IngestionFieldMappingService,
    private readonly logService: IngestionLogService,
    private readonly recordProcessorService: IngestionRecordProcessorService,
    private readonly preprocessorRegistry: IngestionPreprocessorRegistry,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(IngestionPullJob.name)
  async handle(data: IngestionPullJobData): Promise<void> {
    const { pipelineId, workspaceId } = data;

    this.logger.log(`Starting pull ingestion for pipeline ${pipelineId}`);

    const log = await this.logService.createPending(pipelineId, 'pull');

    await this.logService.markRunning(log.id);

    try {
      const pipeline = await this.pipelineService.findEntityById(
        pipelineId,
        workspaceId,
      );

      if (!isDefined(pipeline) || !pipeline.isEnabled) {
        await this.logService.markFailed(
          log.id,
          'Pipeline not found or disabled',
        );

        return;
      }

      if (!isDefined(pipeline.sourceUrl)) {
        await this.logService.markFailed(log.id, 'No source URL configured');

        return;
      }

      const mappings =
        await this.fieldMappingService.findEntitiesByPipelineId(pipelineId);

      if (mappings.length === 0) {
        await this.logService.markFailed(
          log.id,
          'No field mappings configured',
        );

        return;
      }

      // Fetch records from source
      const allRecords = await this.fetchRecords(pipeline);

      if (allRecords.length === 0) {
        await this.logService.markCompleted(log.id, {
          totalRecordsReceived: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          recordsFailed: 0,
        });

        return;
      }

      // Run preprocessor if available (wrapped in workspace context for DB access)
      const authContext = buildSystemAuthContext(workspaceId);
      const preprocessedRecords =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.preprocessorRegistry.preProcessRecords(
              allRecords,
              pipeline,
              workspaceId,
            ),
          authContext,
        );

      this.logger.log(
        `Preprocessed ${preprocessedRecords.length} records for pipeline ${pipelineId}`,
      );

      const result = await this.recordProcessorService.processRecords(
        preprocessedRecords,
        pipeline,
        mappings,
        workspaceId,
      );

      await this.logService.markCompleted(log.id, {
        totalRecordsReceived: allRecords.length,
        ...result,
      });

      this.logger.log(
        `Pull ingestion completed: pipeline=${pipelineId}, total=${allRecords.length}, created=${result.recordsCreated}, updated=${result.recordsUpdated}, failed=${result.recordsFailed}`,
      );
    } catch (error) {
      this.logger.error(
        `Pull ingestion failed: pipeline=${pipelineId}, error=${error}`,
      );

      await this.logService.markFailed(
        log.id,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  private async fetchRecords(pipeline: {
    sourceUrl: string | null;
    sourceHttpMethod: string | null;
    sourceAuthConfig: SourceAuthConfig | null;
    sourceRequestConfig: SourceRequestConfig | null;
    responseRecordsPath: string | null;
    paginationConfig: PaginationConfig | null;
  }): Promise<Record<string, unknown>[]> {
    const allRecords: Record<string, unknown>[] = [];
    let hasMore = true;
    let page = 0;
    let cursor: string | null = null;

    while (hasMore) {
      const url = new URL(pipeline.sourceUrl!);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...pipeline.sourceRequestConfig?.headers,
      };

      // Apply auth
      if (isDefined(pipeline.sourceAuthConfig)) {
        applyAuth(url, headers, pipeline.sourceAuthConfig);
      }

      // Apply query params
      if (isDefined(pipeline.sourceRequestConfig?.queryParams)) {
        for (const [key, value] of Object.entries(
          pipeline.sourceRequestConfig!.queryParams!,
        )) {
          url.searchParams.set(key, value);
        }
      }

      // Apply dynamic date range params
      if (isDefined(pipeline.sourceRequestConfig?.dateRangeParams)) {
        const {
          startParam,
          endParam,
          lookbackMinutes,
          timezone,
          startTimeOverride,
          endTimeOverride,
        } = pipeline.sourceRequestConfig!.dateRangeParams!;

        if (isDefined(startTimeOverride) && isDefined(endTimeOverride)) {
          // Explicit date range (used by backfill script)
          url.searchParams.set(startParam, startTimeOverride);
          url.searchParams.set(endParam, endTimeOverride);
        } else {
          // Normal lookback calculation
          const now = new Date();
          const since = new Date(now.getTime() - lookbackMinutes * 60 * 1000);

          const formatDate = (date: Date): string =>
            date
              .toLocaleString('sv-SE', { timeZone: timezone })
              .replace(' ', 'T');

          url.searchParams.set(startParam, formatDate(since));
          url.searchParams.set(endParam, formatDate(now));
        }
      }

      // Apply pagination params
      if (isDefined(pipeline.paginationConfig)) {
        applyPagination(url, pipeline.paginationConfig, page, cursor);
      }

      const method = pipeline.sourceHttpMethod ?? 'GET';
      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (method === 'POST' && isDefined(pipeline.sourceRequestConfig?.body)) {
        fetchOptions.body = JSON.stringify(pipeline.sourceRequestConfig!.body);
      }

      const response = await fetch(url.toString(), fetchOptions);

      if (!response.ok) {
        throw new Error(
          `Source API returned ${response.status}: ${response.statusText}`,
        );
      }

      const responseData = (await response.json()) as Record<string, unknown>;

      // Extract records from response
      let records: Record<string, unknown>[];

      if (isDefined(pipeline.responseRecordsPath)) {
        const extracted = extractValueByPath(
          responseData,
          pipeline.responseRecordsPath,
        );

        records = Array.isArray(extracted)
          ? (extracted as Record<string, unknown>[])
          : [];
      } else if (Array.isArray(responseData)) {
        records = responseData as Record<string, unknown>[];
      } else {
        records = [responseData];
      }

      allRecords.push(...records);

      // Check if there are more pages
      if (!isDefined(pipeline.paginationConfig) || records.length === 0) {
        hasMore = false;
      } else if (
        isDefined(pipeline.paginationConfig.maxPages) &&
        page + 1 >= pipeline.paginationConfig.maxPages
      ) {
        hasMore = false;
      } else {
        const pageSize = pipeline.paginationConfig.pageSize;

        if (records.length < pageSize) {
          hasMore = false;
        } else if (pipeline.paginationConfig.type === 'cursor') {
          const nextCursor = extractValueByPath(
            responseData,
            pipeline.paginationConfig.cursorPath,
          ) as string | null;

          if (!isDefined(nextCursor)) {
            hasMore = false;
          } else {
            cursor = nextCursor;
          }
        } else {
          page++;
        }
      }
    }

    return allRecords;
  }
}

const applyAuth = (
  url: URL,
  headers: Record<string, string>,
  auth: SourceAuthConfig,
): void => {
  switch (auth.type) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${auth.token}`;
      break;
    case 'api_key':
      headers[auth.headerName] = auth.key;
      break;
    case 'query_param': {
      const tokenValue = isDefined(auth.envVar)
        ? process.env[auth.envVar]
        : auth.value;

      if (isDefined(tokenValue)) {
        url.searchParams.set(auth.paramName, tokenValue);
      }
      break;
    }
    case 'basic': {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString(
        'base64',
      );

      headers['Authorization'] = `Basic ${encoded}`;
      break;
    }
  }
};

const applyPagination = (
  url: URL,
  config: PaginationConfig,
  page: number,
  cursor: string | null,
): void => {
  switch (config.type) {
    case 'offset':
      url.searchParams.set(config.paramName, String(page * config.pageSize));
      break;
    case 'page':
      url.searchParams.set(config.paramName, String(page + 1));
      break;
    case 'cursor':
      if (isDefined(cursor)) {
        url.searchParams.set(config.paramName, cursor);
      }
      break;
  }
};
