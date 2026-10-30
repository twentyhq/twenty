import { Injectable } from '@nestjs/common';

import { type SetuAiTaskProjection } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { SETU_AI_TASK_MAX_ACCOUNTS } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-max-accounts.constant';
import { SetuAiTaskService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task.service';
import { SetuAiTaskException } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task.exception';

const startAccountResearchInputSchema = z.object({
  companyIds: z
    .array(z.string())
    .describe(
      `Exact company record ids, 1 to ${SETU_AI_TASK_MAX_ACCOUNTS}, found with the company search tools first`,
    ),
  focus: z
    .string()
    .optional()
    .describe(
      'Only a focus the person stated, in their own words, at most 12 words. Omit it when they did not state one; never describe the brief format here.',
    ),
  saveBriefsAsNotes: z
    .boolean()
    .describe(
      'True only when the person explicitly asked to save the briefs. Each brief then becomes a note on its company.',
    ),
});

const getAiTaskStatusInputSchema = z.object({
  taskId: z.string().describe('The taskId from start_account_research'),
});

type StartAccountResearchInput = z.infer<
  typeof startAccountResearchInputSchema
>;
type GetAiTaskStatusInput = z.infer<typeof getAiTaskStatusInputSchema>;

const toFailureOutput = (error: unknown): ToolOutput => ({
  success: false,
  message:
    error instanceof SetuAiTaskException
      ? error.message
      : 'The research task could not be started.',
  error: error instanceof SetuAiTaskException ? error.code : 'RESEARCH_FAILED',
});

// The model can describe a task to the person; this summary never includes
// the stored checkpoint, prompts or worker state.
const summarizeTask = (task: SetuAiTaskProjection) => ({
  status: task.status,
  accounts: task.steps.map((step) => ({
    company: step.companyName,
    status: step.status,
    ...(isDefined(step.pendingInput) && {
      waitingFor: step.pendingInput.prompt,
    }),
    ...(isDefined(step.brief) && {
      summary: step.brief.summary,
      savedAsNote: isDefined(step.brief.savedNoteId),
    }),
    ...(isDefined(step.errorCode) && { error: step.errorCode }),
  })),
});

// Builds the chat's trusted half of the task tools: the person, workspace
// and thread come from the authenticated chat context, never from tool input.
@Injectable()
export class SetuAiTaskChatToolsService {
  constructor(private readonly setuAiTaskService: SetuAiTaskService) {}

  createStartAccountResearchTool(
    toolContext: ToolContext,
    preferredModelId?: string,
  ) {
    return {
      description:
        `Start background research on up to ${SETU_AI_TASK_MAX_ACCOUNTS} existing company accounts. ` +
        `It returns at once with a task card that shows progress in this chat; the research keeps running ` +
        `after this turn and the person can keep chatting. Look the companies up first and pass exact ids. ` +
        `Ask the person before starting only when a name matches several company records in the CRM. ` +
        `Do not ask which real-world company a record is: the research identifies it and asks the person itself if needed. ` +
        `Set saveBriefsAsNotes only when the person explicitly asked to save the briefs. ` +
        `A successful result means the task started, not that research is done: never describe results you have not seen.`,
      inputSchema: startAccountResearchInputSchema,
      execute: async (
        input: StartAccountResearchInput,
        executionOptions?: { toolCallId?: string },
      ): Promise<ToolOutput> => {
        try {
          const task = await this.setuAiTaskService.startAccountResearch({
            actor: this.buildActor(toolContext),
            threadId: toolContext.threadId ?? null,
            deduplicationKey: `chat:${toolContext.threadId ?? 'none'}:${executionOptions?.toolCallId ?? JSON.stringify(input)}`,
            companyIds: input.companyIds,
            request: {
              focus: input.focus?.trim().slice(0, 200) || null,
              saveBriefsAsNotes: input.saveBriefsAsNotes,
            },
            preferredModelId,
          });

          return {
            success: true,
            message:
              `Research started for ${input.companyIds.length} account(s). The task card in the chat shows live progress ` +
              `and any question the research needs answered. Tell the person in one short sentence; do not predict findings.`,
            result: {
              interaction: {
                schemaVersion: 1,
                kind: 'task-status',
                taskId: task.id,
              },
            },
          };
        } catch (error) {
          return toFailureOutput(error);
        }
      },
    };
  }

  createGetAiTaskStatusTool(toolContext: ToolContext) {
    return {
      description:
        'Read the current state of a research task started in this chat: each account, whether it is done, waiting for an answer or failed, and finished brief summaries.',
      inputSchema: getAiTaskStatusInputSchema,
      execute: async (input: GetAiTaskStatusInput): Promise<ToolOutput> => {
        try {
          const task = await this.setuAiTaskService.getProjection(
            this.buildActor(toolContext),
            input.taskId,
          );

          return {
            success: true,
            message: `Task is ${task.status}.`,
            result: summarizeTask(task),
          };
        } catch (error) {
          return toFailureOutput(error);
        }
      },
    };
  }

  private buildActor(toolContext: ToolContext): SetuAiActionActor {
    if (
      !isDefined(toolContext.userWorkspaceId) ||
      !isDefined(toolContext.authContext) ||
      !isDefined(toolContext.rolePermissionConfig)
    ) {
      throw new SetuAiTaskException(
        'A signed-in person is required',
        'NOT_AVAILABLE',
      );
    }

    return {
      workspaceId: toolContext.workspaceId,
      userWorkspaceId: toolContext.userWorkspaceId,
      authContext: toolContext.authContext,
      rolePermissionConfig: toolContext.rolePermissionConfig,
    };
  }
}
