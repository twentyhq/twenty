import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { join } from 'path';

import { Repository } from 'typeorm';

import { generateFakeObjectRecordEvent } from 'src/engine/core-modules/event-emitter/utils/generate-fake-object-record-event';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/utils/generate-fake-object-record';
import {
  WorkflowActionType,
  WorkflowStep,
} from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { WorkflowSendEmailStepOutputSchema } from 'src/modules/workflow/workflow-executor/types/workflow-step-settings.type';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class WorkflowBuilderService {
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
    step: WorkflowTrigger | WorkflowStep;
    workspaceId: string;
  }): Promise<object> {
    const stepType = step.type;

    switch (stepType) {
      case WorkflowTriggerType.DATABASE_EVENT: {
        return await this.computeDatabaseEventTriggerOutputSchema({
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

        return await this.computeManualTriggerOutputSchema({
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

        return await this.computeCodeActionOutputSchema({
          serverlessFunctionId,
          serverlessFunctionVersion,
          workspaceId,
          serverlessFunctionService: this.serverlessFunctionService,
          codeIntrospectionService: this.codeIntrospectionService,
        });
      }
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

    if (!['created', 'updated', 'deleted', 'destroyed'].includes(action)) {
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
      action as 'created' | 'updated' | 'deleted' | 'destroyed',
    );
  }

  private async computeManualTriggerOutputSchema<Entity>({
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

    const fakeFunctionInput =
      codeIntrospectionService.generateInputData(sourceCode);

    // handle the case when event parameter is destructured:
    // (event: {param1: string; param2: number}) VS ({param1, param2}: {param1: string; param2: number})
    const formattedInput = Object.values(fakeFunctionInput)[0];

    const resultFromFakeInput =
      await serverlessFunctionService.executeOneServerlessFunction(
        serverlessFunctionId,
        workspaceId,
        formattedInput,
        serverlessFunctionVersion,
      );

    return resultFromFakeInput.data ?? {};
  }
}
