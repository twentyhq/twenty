import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { join } from 'path';

import { Repository } from 'typeorm';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { CodeIntrospectionService } from 'src/modules/code-introspection/code-introspection.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import {
  WorkflowActionType,
  WorkflowStep,
} from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { isDefined } from 'src/utils/is-defined';
import { generateFakeObjectRecordEvent } from 'src/engine/core-modules/event-emitter/utils/generate-fake-object-record-event';
import { INDEX_FILE_NAME } from 'src/engine/core-modules/serverless/drivers/constants/index-file-name';

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
  }) {
    const stepType = step.type;

    switch (stepType) {
      case WorkflowTriggerType.DATABASE_EVENT: {
        const [nameSingular, action] = step.settings.eventName.split('.');

        if (!['created', 'updated', 'deleted', 'destroyed'].includes(action)) {
          return {};
        }

        const objectMetadata =
          await this.objectMetadataRepository.findOneOrFail({
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
      case WorkflowActionType.SEND_EMAIL: {
        return { success: true };
      }
      case WorkflowActionType.CODE: {
        const { serverlessFunctionId, serverlessFunctionVersion } =
          step.settings.input;

        if (serverlessFunctionId === '') {
          return {};
        }

        const sourceCode = (
          await this.serverlessFunctionService.getServerlessFunctionSourceCode(
            workspaceId,
            serverlessFunctionId,
            serverlessFunctionVersion,
          )
        )?.[join('src', INDEX_FILE_NAME)];

        if (!isDefined(sourceCode)) {
          return {};
        }

        const fakeFunctionInput =
          this.codeIntrospectionService.generateInputData(sourceCode);

        // handle the case when event parameter is destructured:
        // (event: {param1: string; param2: number}) VS ({param1, param2}: {param1: string; param2: number})
        const formattedInput = Object.values(fakeFunctionInput)[0];

        const resultFromFakeInput =
          await this.serverlessFunctionService.executeOneServerlessFunction(
            serverlessFunctionId,
            workspaceId,
            formattedInput,
            serverlessFunctionVersion,
          );

        return resultFromFakeInput.data ?? {};
      }
      default:
        throw new Error(`Unknown type ${stepType}`);
    }
  }
}
