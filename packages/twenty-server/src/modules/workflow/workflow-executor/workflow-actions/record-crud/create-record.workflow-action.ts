import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { Repository } from 'typeorm';
import { resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowCreateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-create-record-action.guard';
import { WorkflowCreateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class CreateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly recordPositionService: RecordPositionService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

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

    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        workflowActionInput.objectName,
        { shouldBypassPermissionChecks: true },
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

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata,
      workspaceId,
    });

    const { objectMetadataItemWithFieldsMaps } =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        workflowActionInput.objectName,
        workspaceId,
      );

    const validObjectRecord = Object.fromEntries(
      Object.entries(workflowActionInput.objectRecord).filter(([key]) =>
        isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]),
      ),
    );

    const transformedObjectRecord =
      await this.recordInputTransformerService.process({
        recordInput: validObjectRecord,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      });

    const objectRecord = await repository.save({
      ...transformedObjectRecord,
      position,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    });

    return {
      result: objectRecord,
    };
  }
}
