import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record-event';
import { WorkflowSendEmailStepOutputSchema } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/send-email.workflow-action';
import { WorkflowRecordCRUDType } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-input.type';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class WorkflowBuilderWorkspaceService {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly codeIntrospectionService: CodeIntrospectionService,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  async computeStepOutputSchema({
    step,
    workspaceId,
  }: {
    step: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
  }): Promise<object> {
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
      case WorkflowActionType.SEND_EMAIL: {
        return this.computeSendEmailActionOutputSchema();
      }
      case WorkflowActionType.CODE: {
        const { serverlessFunctionId, serverlessFunctionVersion } =
          step.settings.input;

        return this.computeCodeActionOutputSchema({
          serverlessFunctionId,
          serverlessFunctionVersion,
          workspaceId,
          serverlessFunctionService: this.serverlessFunctionService,
          codeIntrospectionService: this.codeIntrospectionService,
        });
      }
      case WorkflowActionType.RECORD_CRUD:
        return this.computeRecordCrudOutputSchema({
          objectType: step.settings.input.objectName,
          operationType: step.settings.input.type,
          workspaceId,
          objectMetadataRepository: this.objectMetadataRepository,
        });
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
  }) {
    const [nameSingular, action] = eventName.split('.');

    if (!checkStringIsDatabaseEventAction(action)) {
      return {};
    }

    const objectMetadata = await objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular,
        workspaceId,
      },
      relations: ['fields'],
    });

    if (!isDefined(objectMetadata)) {
      return {};
    }

    return generateFakeObjectRecordEvent(
      objectMetadata,
      action as DatabaseEventAction,
    );
  }

  private async computeRecordCrudOutputSchema<Entity>({
    objectType,
    operationType,
    workspaceId,
    objectMetadataRepository,
  }: {
    objectType: string;
    operationType: string;
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }) {
    const recordOutputSchema = await this.computeRecordOutputSchema<Entity>({
      objectType,
      workspaceId,
      objectMetadataRepository,
    });

    if (operationType === WorkflowRecordCRUDType.READ) {
      return {
        first: recordOutputSchema,
        last: recordOutputSchema,
        totalCount: generateFakeValue('number'),
      };
    }

    return recordOutputSchema;
  }

  private async computeRecordOutputSchema<Entity>({
    objectType,
    workspaceId,
    objectMetadataRepository,
  }: {
    objectType: string;
    workspaceId: string;
    objectMetadataRepository: Repository<ObjectMetadataEntity>;
  }) {
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

    return generateFakeObjectRecord<Entity>(objectMetadata);
  }

  private computeSendEmailActionOutputSchema(): WorkflowSendEmailStepOutputSchema {
    return { success: true };
  }

  private async computeCodeActionOutputSchema({
    serverlessFunctionId,
    serverlessFunctionVersion,
    workspaceId,
    serverlessFunctionService,
    codeIntrospectionService,
  }: {
    serverlessFunctionId: string;
    serverlessFunctionVersion: string;
    workspaceId: string;
    serverlessFunctionService: ServerlessFunctionService;
    codeIntrospectionService: CodeIntrospectionService;
  }) {
    if (serverlessFunctionId === '') {
      return {};
    }

    const sourceCode = (
      await serverlessFunctionService.getServerlessFunctionSourceCode(
        workspaceId,
        serverlessFunctionId,
        serverlessFunctionVersion,
      )
    )?.[join('src', INDEX_FILE_NAME)];

    if (!isDefined(sourceCode)) {
      return {};
    }

    const inputSchema =
      codeIntrospectionService.getFunctionInputSchema(sourceCode);
    const fakeFunctionInput =
      codeIntrospectionService.generateInputData(inputSchema);

    const resultFromFakeInput =
      await serverlessFunctionService.executeOneServerlessFunction(
        serverlessFunctionId,
        workspaceId,
        fakeFunctionInput,
        serverlessFunctionVersion,
      );

    return resultFromFakeInput.data ?? {};
  }
}
