import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowCreateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-create-record-action.guard';
import { WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowExecutor {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async execute({
    currentStepIndex,
    steps,
    context,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps[currentStepIndex];

    if (!isWorkflowCreateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a create record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new RecordCRUDActionException(
        'Failed to create: Workspace ID is required',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowCreateRecordActionInput;

    const repository = await this.twentyORMManager.getRepository(
      workflowActionInput.objectName,
    );

    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: workflowActionInput.objectName,
      },
    });

    if (!objectMetadata) {
      throw new RecordCRUDActionException(
        'Failed to create: Object metadata not found',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    const objectRecord = await repository.save({
      ...workflowActionInput.objectRecord,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: workflowActionInput.objectName,
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: objectRecord.id,
          objectMetadata,
          properties: {
            after: objectRecord,
          },
        },
      ],
      workspaceId,
    });

    return {
      result: objectRecord,
    };
  }
}
