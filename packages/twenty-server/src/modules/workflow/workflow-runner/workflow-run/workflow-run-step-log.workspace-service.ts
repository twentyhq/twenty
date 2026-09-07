import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import { DataSource } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const MAX_STEP_LOG_BYTES = 256_000;

const computeSizeBytes = (value: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');
  } catch {
    return 0;
  }
};

@Injectable()
export class WorkflowRunStepLogWorkspaceService {
  private readonly logger = new Logger(WorkflowRunStepLogWorkspaceService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async setStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    stepLog,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    stepLog: WorkflowRunStepLog;
  }): Promise<void> {
    const sizeBytes = computeSizeBytes(stepLog);

    if (sizeBytes > MAX_STEP_LOG_BYTES) {
      this.logger.warn(
        `Step log for workflowRun=${workflowRunId} step=${stepId} exceeds cap (${sizeBytes}b > ${MAX_STEP_LOG_BYTES}b) and will be dropped`,
      );

      return;
    }

    const stepLogWithSize: WorkflowRunStepLog = {
      ...stepLog,
      sizeBytes,
    };

    const schemaName = getWorkspaceSchemaName(workspaceId);

    await this.coreDataSource.query(
      `UPDATE ${schemaName}."workflowRun" SET "stepLogs" = jsonb_set(COALESCE("stepLogs", '{}'::jsonb), ARRAY[$1]::text[], $2::jsonb, true) WHERE "id" = $3`,
      [stepId, JSON.stringify(stepLogWithSize), workflowRunId],
    );
  }
}
