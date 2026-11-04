import { Injectable } from '@nestjs/common';

import { createHash } from 'crypto';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

const CODE_STEP_RUNTIME = LogicFunctionRuntime.NODE22;

const CODE_STEP_BUILD_LOCK_OPTIONS = {
  ttl: 60_000,
  ms: 500,
  maxRetries: 120,
};

@Injectable()
export class CodeStepRunnerService {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async run({
    flatApplication,
    code,
    payload,
    userId,
    userWorkspaceId,
    workflowId,
  }: {
    flatApplication: FlatApplication;
    code: string;
    payload: object;
    userId?: string;
    userWorkspaceId?: string;
    workflowId?: string;
  }): Promise<LogicFunctionExecuteResult> {
    try {
      return await this.logicFunctionExecutorService.executeBuiltCode({
        workspaceId: flatApplication.workspaceId,
        flatApplication,
        getBuiltHandlerPath: () => this.getOrBuild({ flatApplication, code }),
        payload,
        userId,
        userWorkspaceId,
        workflowId,
      });
    } catch (error) {
      if (
        !(error instanceof LogicFunctionException) ||
        error.code !==
          LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED
      ) {
        throw error;
      }

      return {
        data: null,
        logs: '',
        duration: 0,
        billedDurationMs: 0,
        status: LogicFunctionExecutionStatus.ERROR,
        error: {
          errorType: 'BuildError',
          errorMessage: error.message,
          stackTrace: [],
        },
      };
    }
  }

  async getOrBuild({
    flatApplication,
    code,
  }: {
    flatApplication: FlatApplication;
    code: string;
  }): Promise<string> {
    const codeHash = createHash('sha256')
      .update(`${CODE_STEP_RUNTIME}\n${code}`)
      .digest('hex');

    const builtFileIdentifier = {
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      builtHandlerPath: `workflow-code-steps/${codeHash}/index.mjs`,
    };

    if (
      await this.logicFunctionResourceService.builtFileExists(
        builtFileIdentifier,
      )
    ) {
      return builtFileIdentifier.builtHandlerPath;
    }

    await this.cacheLockService.withLock(
      async () => {
        if (
          await this.logicFunctionResourceService.builtFileExists(
            builtFileIdentifier,
          )
        ) {
          return;
        }

        const { builtCode } = await this.logicFunctionExecutorService.transpile(
          {
            targetRuntime: CODE_STEP_RUNTIME,
            sourceCode: code,
            sourceFileName: 'index.ts',
            builtFileName: 'index.mjs',
          },
        );

        await this.logicFunctionResourceService.uploadBuiltFile({
          ...builtFileIdentifier,
          builtCode,
        });
      },
      `workflow-code-step-build:${flatApplication.id}:${codeHash}`,
      CODE_STEP_BUILD_LOCK_OPTIONS,
    );

    return builtFileIdentifier.builtHandlerPath;
  }
}
