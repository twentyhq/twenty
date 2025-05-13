import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeFormResponse } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-response';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowSchemaWorkspaceService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async computeStepOutputSchema({
    step,
    workspaceId,
  }: {
    step: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const stepType = step.type;

    switch (stepType) {
      case WorkflowTriggerType.DATABASE_EVENT: {
        return this.computeDatabaseEventTriggerOutputSchema({
          eventName: step.settings.eventName,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
      }
      case WorkflowTriggerType.MANUAL: {
        const { objectType } = step.settings;

        if (!objectType) {
          return {};
        }

        return this.computeRecordOutputSchema({
          objectType,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
      }
      case WorkflowTriggerType.WEBHOOK:
      case WorkflowTriggerType.CRON: {
        return {};
      }
      case WorkflowActionType.SEND_EMAIL: {
        return this.computeSendEmailActionOutputSchema();
      }
      case WorkflowActionType.CREATE_RECORD:
      case WorkflowActionType.UPDATE_RECORD:
      case WorkflowActionType.DELETE_RECORD:
        return this.computeRecordOutputSchema({
          objectType: step.settings.input.objectName,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
      case WorkflowActionType.FIND_RECORDS:
        return this.computeFindRecordsOutputSchema({
          objectType: step.settings.input.objectName,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
      case WorkflowActionType.FORM:
        return this.computeFormActionOutputSchema({
          formMetadata: step.settings.input,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
      case WorkflowActionType.CODE: // StepOutput schema is computed on serverlessFunction draft execution
      default:
        return {};
    }
  }

  private async computeDatabaseEventTriggerOutputSchema({
    eventName,
    workspaceId,
    objectMetadataRepository,
  }: {
    eventName: string;
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }): Promise<OutputSchema> {
    const [nameSingular, action] = eventName.split('.');

    if (!checkStringIsDatabaseEventAction(action)) {
      return {};
    }

    const objectMetadata = await objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular,
        workspaceId,
      },
      relations: ['fields', 'fields.relationTargetObjectMetadata.fields'],
    });

    if (!isDefined(objectMetadata)) {
      return {};
    }

    return generateFakeObjectRecordEvent(
      objectMetadata,
      action as DatabaseEventAction,
    );
  }

  private async computeFindRecordsOutputSchema({
    objectType,
    workspaceId,
    objectMetadataRepository,
  }: {
    objectType: string;
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }): Promise<OutputSchema> {
    const recordOutputSchema = await this.computeRecordOutputSchema({
      objectType,
      workspaceId,
      objectMetadataRepository,
    });

    return {
      first: {
        isLeaf: false,
        icon: 'IconAlpha',
        value: recordOutputSchema,
      },
      last: { isLeaf: false, icon: 'IconOmega', value: recordOutputSchema },
      totalCount: {
        isLeaf: true,
        icon: 'IconSum',
        type: 'number',
        value: generateFakeValue('number'),
      },
    };
  }

  private async computeRecordOutputSchema({
    objectType,
    workspaceId,
    objectMetadataRepository,
  }: {
    objectType: string;
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }): Promise<OutputSchema> {
    const objectMetadata = await objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: objectType,
        workspaceId,
      },
      relations: ['fields'],
    });

    if (!isDefined(objectMetadata)) {
      return {};
    }

    return generateFakeObjectRecord(objectMetadata);
  }

  private computeSendEmailActionOutputSchema(): OutputSchema {
    return { success: { isLeaf: true, type: 'boolean', value: true } };
  }

  private async computeFormActionOutputSchema({
    formMetadata,
    workspaceId,
    objectMetadataRepository,
  }: {
    formMetadata: FormFieldMetadata[];
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }): Promise<OutputSchema> {
    return generateFakeFormResponse({
      formMetadata,
      workspaceId,
      objectMetadataRepository,
    });
  }
}
