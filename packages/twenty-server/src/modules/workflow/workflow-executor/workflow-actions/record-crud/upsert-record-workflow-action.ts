import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  RecordCRUDActionException,
  RecordCRUDActionExceptionCode,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/exceptions/record-crud-action.exception';
import { isWorkflowUpsertRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/guards/is-workflow-upsert-record-action.guard';
import { type WorkflowUpsertRecordActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';

import { RecordCrudWorkflowActionBase } from './record-crud-workflow-action-base';

@Injectable()
export class UpsertRecordWorkflowAction extends RecordCrudWorkflowActionBase {
  constructor(
    twentyORMGlobalManager: TwentyORMGlobalManager,
    scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    recordInputTransformerService: RecordInputTransformerService,
    recordPositionService: RecordPositionService,
  ) {
    super(
      twentyORMGlobalManager,
      scopedWorkspaceContextFactory,
      workflowCommonWorkspaceService,
      recordInputTransformerService,
      recordPositionService,
    );
  }

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = await this.findStepOrThrowSafe(steps, currentStepId);

    if (!isWorkflowUpsertRecordAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an upsert record action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput =
      this.resolveInputSafe<WorkflowUpsertRecordActionInput>(
        step.settings.input as Record<string, unknown>,
        context,
      );

    const workspaceId = await this.getWorkspaceId();

    try {
      const { repository, objectMetadataItemWithFieldsMaps } =
        await this.getRepositoryAndMetadata(
          workspaceId,
          workflowActionInput.objectName,
        );

      const existingRecord = await this.findExistingRecord(
        repository,
        workflowActionInput,
      );

      let result: ObjectLiteral;

      if (existingRecord) {
        result = await this.updateExistingRecord(
          repository,
          existingRecord,
          workflowActionInput,
          objectMetadataItemWithFieldsMaps,
        );
      } else {
        result = await this.createRecord(
          repository,
          workflowActionInput.objectRecord,
          objectMetadataItemWithFieldsMaps,
          workspaceId,
        );
      }

      return { result };
    } catch (error) {
      if (error instanceof RecordCRUDActionException) {
        return { error: error.message };
      }

      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async findExistingRecord(
    repository: ObjectLiteral,
    workflowActionInput: WorkflowUpsertRecordActionInput,
  ): Promise<ObjectLiteral | null> {
    const { matchFields } = workflowActionInput.upsertCriteria;
    const { objectRecord } = workflowActionInput;

    if (!matchFields || matchFields.length === 0) {
      return null;
    }

    const whereClause: Record<string, unknown> = {};

    for (const field of matchFields) {
      if (objectRecord[field] !== undefined) {
        whereClause[field] = objectRecord[field];
      }
    }

    if (Object.keys(whereClause).length === 0) {
      return null;
    }

    return await repository.findOne({
      where: whereClause,
    });
  }

  private async updateExistingRecord(
    repository: ObjectLiteral,
    existingRecord: ObjectLiteral,
    workflowActionInput: WorkflowUpsertRecordActionInput,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
  ): Promise<ObjectLiteral> {
    const { objectRecord, fieldsToUpdate } = workflowActionInput;

    const updateData: Record<string, unknown> = {};

    if (fieldsToUpdate && fieldsToUpdate.length > 0) {
      for (const field of fieldsToUpdate) {
        if (
          objectRecord[field] !== undefined &&
          isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[field])
        ) {
          updateData[field] = objectRecord[field];
        }
      }
    } else {
      Object.entries(objectRecord).forEach(([key, value]) => {
        if (isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key])) {
          updateData[key] = value;
        }
      });
    }

    if (Object.keys(updateData).length === 0) {
      return existingRecord;
    }

    const transformedObjectRecord =
      await this.recordInputTransformerService.process({
        recordInput: updateData,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      });

    await repository.update(existingRecord.id, transformedObjectRecord);

    const updatedRecord = await repository.findOne({
      where: { id: existingRecord.id },
    });

    if (!updatedRecord) {
      throw new RecordCRUDActionException(
        'Failed to retrieve updated record',
        RecordCRUDActionExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return updatedRecord;
  }

  private async createNewRecord(
    repository: ObjectLiteral,
    workflowActionInput: WorkflowUpsertRecordActionInput,
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
    workspaceId: string,
  ): Promise<ObjectLiteral> {
    const { objectRecord } = workflowActionInput;

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: objectMetadataItemWithFieldsMaps,
      workspaceId,
    });

    const validObjectRecord = Object.fromEntries(
      Object.entries(objectRecord).filter(([key]) =>
        isDefined(objectMetadataItemWithFieldsMaps.fieldIdByName[key]),
      ),
    );

    const transformedObjectRecord =
      await this.recordInputTransformerService.process({
        recordInput: validObjectRecord,
        objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
      });

    const recordToInsert = {
      ...transformedObjectRecord,
      position,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        name: 'Workflow',
      },
    };

    const insertResult = await repository.insert(recordToInsert);

    const createdRecord = insertResult.generatedMaps[0] as ObjectLiteral;

    if (!createdRecord) {
      throw new RecordCRUDActionException(
        'Failed to create record',
        RecordCRUDActionExceptionCode.INVALID_REQUEST,
      );
    }

    return createdRecord;
  }
}
