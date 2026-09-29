import { Injectable, Logger } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, IsNull, Not } from 'typeorm';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { isDuplicateEntryError } from 'src/engine/twenty-orm/utils/is-duplicate-entry-error.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import {
  InputAskException,
  InputAskExceptionCode,
} from 'src/modules/input-ask/input-ask.exception';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';

// A form step's Ask is keyed by its run and step; any Ask a tool call opened,
// in a chat or in a run, by the conversation and the call.
export type InputAskKey =
  | { workflowRunId: string; stepId: string }
  | { threadId: string; toolCallId: string };

export type InputAskToOpen = Pick<
  InputAskWorkspaceEntity,
  'name' | 'form' | 'assigneeId'
> &
  Partial<
    Pick<
      InputAskWorkspaceEntity,
      'workflowRunId' | 'stepId' | 'threadId' | 'toolCallId'
    >
  >;

const isToolCallKey = (
  key: InputAskKey,
): key is { threadId: string; toolCallId: string } => 'toolCallId' in key;

const buildKeyWhere = (
  key: InputAskKey,
): FindOptionsWhere<InputAskWorkspaceEntity> =>
  isToolCallKey(key)
    ? { threadId: key.threadId, toolCallId: key.toolCallId }
    : {
        workflowRunId: key.workflowRunId,
        stepId: key.stepId,
        toolCallId: IsNull(),
      };

@Injectable()
export class InputAskWorkspaceService {
  private readonly logger = new Logger(InputAskWorkspaceService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // A run can re-enter a step it already asked about (a retried worker, a
  // retried run, the next item of an iterator): the key's unique index turns
  // that into a duplicate, and the existing Ask is asked again rather than a
  // second one opened.
  async open({
    workspaceId,
    inputAsk,
  }: {
    workspaceId: string;
    inputAsk: InputAskToOpen;
  }): Promise<void> {
    const key = this.getKey(inputAsk);

    await this.execute({
      workspaceId,
      // A paused tool call can only be answered through its Ask, so it must
      // not pause without one. A form step still parks, and the 2.44 upgrade
      // opens the Ask it waits on.
      whenObjectMissing: () => {
        if (isToolCallKey(key)) {
          throw new InputAskException(
            'This workspace cannot record a request for input yet',
            InputAskExceptionCode.INPUT_ASK_OBJECT_MISSING,
          );
        }
      },
      run: async (inputAskRepository) => {
        const position = await this.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: { isCustom: false, nameSingular: 'inputAsk' },
          workspaceId,
        });

        try {
          await inputAskRepository.insert({
            ...inputAsk,
            status: InputAskStatus.PENDING,
            position,
          });

          return;
        } catch (error) {
          if (!isDuplicateEntryError(error)) {
            throw error;
          }
        }

        await inputAskRepository.update(
          { ...buildKeyWhere(key), status: Not(InputAskStatus.PENDING) },
          {
            name: inputAsk.name,
            form: inputAsk.form,
            status: InputAskStatus.PENDING,
            response: null,
            answeredAt: null,
          },
        );
      },
    });
  }

  // Moving an Ask out of PENDING is the claim on it: of two concurrent
  // answers only one sees a row change, so only one resumes what waits on it.
  async answer({
    workspaceId,
    key,
    response,
  }: {
    workspaceId: string;
    key: InputAskKey;
    response: Record<string, unknown>;
  }): Promise<boolean> {
    return this.execute({
      workspaceId,
      whenObjectMissing: () => false,
      run: async (inputAskRepository) => {
        const result = await inputAskRepository.update(
          { ...buildKeyWhere(key), status: InputAskStatus.PENDING },
          {
            status: InputAskStatus.ANSWERED,
            response,
            answeredAt: new Date().toISOString(),
          },
        );

        return (result.affected ?? 0) > 0;
      },
    });
  }

  async cancel({
    workspaceId,
    match,
  }: {
    workspaceId: string;
    match: InputAskKey | { workflowRunId: string };
  }): Promise<boolean> {
    const cancelPending = () =>
      this.execute({
        workspaceId,
        whenObjectMissing: () => false,
        run: async (inputAskRepository) => {
          const result = await inputAskRepository.update(
            {
              ...('stepId' in match || 'toolCallId' in match
                ? buildKeyWhere(match)
                : { workflowRunId: match.workflowRunId }),
              status: InputAskStatus.PENDING,
            },
            { status: InputAskStatus.CANCELED },
          );

          return (result.affected ?? 0) > 0;
        },
      });

    if ('stepId' in match || 'toolCallId' in match) {
      return cancelPending();
    }

    // Closing what an ended run left pending is housekeeping: the run is over
    // either way, and a failure here only leaves a stale Ask behind.
    try {
      return await cancelPending();
    } catch (error) {
      this.logger.error(
        `Failed to cancel the Asks of workflow run ${match.workflowRunId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }

  async findPendingForThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<Pick<
    InputAskWorkspaceEntity,
    'id' | 'toolCallId' | 'workflowRunId'
  > | null> {
    return this.execute({
      workspaceId,
      whenObjectMissing: () => null,
      run: (inputAskRepository) =>
        inputAskRepository.findOne({
          where: { threadId, status: InputAskStatus.PENDING },
          select: { id: true, toolCallId: true, workflowRunId: true },
        }),
    });
  }

  async findReadable({
    workspaceId,
    inputAskId,
  }: {
    workspaceId: string;
    inputAskId: string;
  }): Promise<Pick<
    InputAskWorkspaceEntity,
    | 'id'
    | 'status'
    | 'form'
    | 'threadId'
    | 'toolCallId'
    | 'workflowRunId'
    | 'stepId'
  > | null> {
    return this.execute({
      workspaceId,
      asCaller: true,
      whenObjectMissing: () => null,
      run: (inputAskRepository) =>
        inputAskRepository.findOne({
          where: { id: inputAskId },
          select: {
            id: true,
            status: true,
            form: true,
            threadId: true,
            toolCallId: true,
            workflowRunId: true,
            stepId: true,
          },
        }),
    });
  }

  private getKey(inputAsk: InputAskToOpen): InputAskKey {
    if (isDefined(inputAsk.threadId) && isDefined(inputAsk.toolCallId)) {
      return { threadId: inputAsk.threadId, toolCallId: inputAsk.toolCallId };
    }

    if (isDefined(inputAsk.workflowRunId) && isDefined(inputAsk.stepId)) {
      return { workflowRunId: inputAsk.workflowRunId, stepId: inputAsk.stepId };
    }

    throw new InputAskException(
      'An Ask needs a tool call or a workflow step to be answered through',
      InputAskExceptionCode.INPUT_ASK_WITHOUT_KEY,
    );
  }

  private async hasInputAskObject(workspaceId: string): Promise<boolean> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return isDefined(
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.inputAsk.universalIdentifier
      ],
    );
  }

  // The object reaches existing workspaces through a workspace upgrade command,
  // which runs per workspace while this code is already serving, and an
  // interrupted upgrade leaves the rest without it indefinitely: every use
  // says what it means for a workspace that does not have it yet.
  private async execute<TResult>({
    workspaceId,
    asCaller = false,
    whenObjectMissing,
    run,
  }: {
    workspaceId: string;
    // Read as the caller: an Ask they cannot read is one they cannot answer.
    asCaller?: boolean;
    whenObjectMissing: () => TResult;
    run: (
      inputAskRepository: WorkspaceRepository<InputAskWorkspaceEntity>,
    ) => Promise<TResult>;
  }): Promise<TResult> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return whenObjectMissing();
    }

    if (asCaller) {
      return this.workspaceOrmManager.executeInWorkspaceContext(async () =>
        run(
          this.workspaceOrmManager.getRepositoryWithContextPermissions<InputAskWorkspaceEntity>(
            'inputAsk',
          ),
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        run(
          this.workspaceOrmManager.getRepository<InputAskWorkspaceEntity>(
            'inputAsk',
            { shouldBypassPermissionChecks: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
