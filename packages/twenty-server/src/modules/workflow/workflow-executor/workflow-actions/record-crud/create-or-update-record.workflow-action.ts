import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { resolveInput } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
    WorkflowStepExecutorException,
    WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import {
    RecordCRUDActionException,
    RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowCreateOrUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-create-or-update-record-action.guard';
import { type WorkflowCreateOrUpdateRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

@Injectable()
export class CreateOrUpdateRecordWorkflowAction implements WorkflowAction {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowCreateOrUpdateRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a create or update record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowCreateOrUpdateRecordActionInput;

    const { workspaceId } = this.scopedWorkspaceContextFactory.create();

    if (!workspaceId) {
      throw new WorkflowStepExecutorException(
        'Scoped workspace not found',
        WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND,
      );
    }

    try {
      const { objectMetadataItemWithFieldsMaps, objectMetadataMaps } =
        await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
          workflowActionInput.objectName,
          workspaceId,
        );

      if (!objectMetadataItemWithFieldsMaps) {
        throw new RecordCRUDActionException(
          `Object "${workflowActionInput.objectName}" not found`,
          RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
        );
      }

      const repository = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        workflowActionInput.objectName,
      );

      // Search for existing record based on match fields
      const existingRecord = await this.findExistingRecord(
        repository,
        workflowActionInput,
      );

      let result;

      if (existingRecord) {
        // Update existing record
        result = await this.updateExistingRecord(
          repository,
          existingRecord,
          workflowActionInput,
          objectMetadataItemWithFieldsMaps,
          objectMetadataMaps,
        );
      } else {
        // Create new record
        result = await this.createNewRecord(
          repository,
          workflowActionInput,
          objectMetadataItemWithFieldsMaps,
          objectMetadataMaps,
        );
      }

      return { result };
    } catch (error) {
      if (error instanceof RecordCRUDActionException) {
        return { error: error.message };
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async findExistingRecord(
    repository: any,
    workflowActionInput: WorkflowCreateOrUpdateRecordActionInput,
  ) {
    const { matchFields } = workflowActionInput.upsertCriteria;
    const { objectRecord } = workflowActionInput;

    if (!matchFields || matchFields.length === 0) {
      return null;
    }

    // Build where clause based on match fields
    const whereClause: Record<string, any> = {};
    for (const field of matchFields) {
      if (objectRecord[field] !== undefined) {
        whereClause[field] = objectRecord[field];
      }
    }

    if (Object.keys(whereClause).length === 0) {
      return null;
    }

    // Find the first matching record
    const existingRecords = await repository.find({
      where: whereClause,
      take: 1,
    });

    return existingRecords.length > 0 ? existingRecords[0] : null;
  }

  private async updateExistingRecord(
    repository: any,
    existingRecord: any,
    workflowActionInput: WorkflowCreateOrUpdateRecordActionInput,
    objectMetadataItemWithFieldsMaps: any,
    objectMetadataMaps: any,
  ) {
    const { objectRecord, fieldsToUpdate } = workflowActionInput;
    
    // If fieldsToUpdate is specified, only update those fields
    const updateData: Record<string, any> = {};
    
    if (fieldsToUpdate && fieldsToUpdate.length > 0) {
      for (const field of fieldsToUpdate) {
        if (objectRecord[field] !== undefined) {
          updateData[field] = objectRecord[field];
        }
      }
    } else {
      // Update all provided fields
      Object.assign(updateData, objectRecord);
    }

    // Don't update if no data to update
    if (Object.keys(updateData).length === 0) {
      return existingRecord;
    }

    const updatedRecord = await repository.update(existingRecord.id, updateData);
    
    // Return the updated record
    return await repository.findOne({ where: { id: existingRecord.id } });
  }

  private async createNewRecord(
    repository: any,
    workflowActionInput: WorkflowCreateOrUpdateRecordActionInput,
    objectMetadataItemWithFieldsMaps: any,
    objectMetadataMaps: any,
  ) {
    const { objectRecord } = workflowActionInput;

    const createdRecord = await repository.save(objectRecord);
    
    return createdRecord;
  }
}
