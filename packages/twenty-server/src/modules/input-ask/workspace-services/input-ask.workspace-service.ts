import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskSource } from 'src/modules/input-ask/enums/input-ask-source.enum';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

@Injectable()
export class InputAskWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // A run can re-enter a pending step — a retry, a resumed worker — so the Ask
  // is keyed on the step rather than created per execution, or a member would
  // find the same question waiting for them several times over.
  async openForWorkflowRunStep({
    workspaceId,
    workflowRunId,
    stepId,
    stepName,
    fields,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    stepName: string;
    fields: FormFieldMetadata[];
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      const existingInputAsk = await inputAskRepository.findOne({
        where: { workflowRunId, stepId },
      });

      if (isDefined(existingInputAsk)) {
        return;
      }

      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: { isCustom: false, nameSingular: 'inputAsk' },
        workspaceId,
      });

      await inputAskRepository.insert({
        name: stepName,
        status: InputAskStatus.PENDING,
        source: InputAskSource.WORKFLOW_RUN_STEP,
        form: { fields },
        workflowRunId,
        stepId,
        position,
      });
    });
  }

  // The PENDING filter is the exactly-once gate, so the caller needs to know
  // which of the three happened: it resumes the run only on 'answered', and
  // 'no-ask' keeps a run that predates this object answerable.
  async answerForWorkflowRunStep({
    workspaceId,
    workflowRunId,
    stepId,
    response,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    response: Record<string, unknown>;
  }): Promise<'answered' | 'already-answered' | 'no-ask'> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return 'no-ask';
    }

    return this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      const answerResult = await inputAskRepository.update(
        { workflowRunId, stepId, status: InputAskStatus.PENDING },
        {
          status: InputAskStatus.ANSWERED,
          response,
          answeredAt: new Date().toISOString(),
        },
      );

      if ((answerResult.affected ?? 0) > 0) {
        return 'answered';
      }

      const existingInputAsk = await inputAskRepository.findOne({
        where: { workflowRunId, stepId },
      });

      return isDefined(existingInputAsk) ? 'already-answered' : 'no-ask';
    });
  }

  // A run that ends without reaching its form leaves the question unanswerable,
  // and an unanswerable question left PENDING sits in someone's list forever.
  async cancelPendingForWorkflowRun({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<void> {
    if (!(await this.hasInputAskObject(workspaceId))) {
      return;
    }

    await this.executeAsSystem(workspaceId, async (inputAskRepository) => {
      await inputAskRepository.update(
        { workflowRunId, status: InputAskStatus.PENDING },
        { status: InputAskStatus.CANCELED },
      );
    });
  }

  // The object reaches existing workspaces through a workspace upgrade command,
  // which runs per workspace while this code is already serving — and an
  // interrupted upgrade leaves the rest without it indefinitely. Until a
  // workspace has the object, a form step behaves exactly as it did before.
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

  private async executeAsSystem<TResult>(
    workspaceId: string,
    execute: (
      inputAskRepository: WorkspaceRepository<InputAskWorkspaceEntity>,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        execute(
          this.workspaceOrmManager.getRepository<InputAskWorkspaceEntity>(
            'inputAsk',
            { shouldBypassPermissionChecks: true },
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
