import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type AgentRunSummary } from 'twenty-shared/ai';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import { DataSource } from 'typeorm';

import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';
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

  // a log of the run, not its outcome, so a write failure must not fail the step
  async setAiAgentStepLog({
    workflowRunId,
    workspaceId,
    stepId,
    summary,
    threadId,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepId: string;
    summary: AgentRunSummary;
    threadId: string;
  }): Promise<void> {
    const stepLog = buildAiAgentStepLog({ summary, threadId });

    try {
      await this.setStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        // tool calls are what outgrows the cap, and the usage and the conversation link must stay
        stepLog:
          computeSizeBytes(stepLog) > MAX_STEP_LOG_BYTES
            ? {
                ...buildAiAgentStepLog({
                  summary: { ...summary, toolCalls: [] },
                  threadId,
                }),
                truncated: {
                  droppedEntries: summary.toolCalls.length,
                  droppedBytes: computeSizeBytes(summary.toolCalls),
                },
              }
            : stepLog,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist step log for workflowRun=${workflowRunId} step=${stepId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
