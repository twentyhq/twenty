import { Test } from '@nestjs/testing';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { CodeStepRunnerService } from 'src/modules/workflow/workflow-executor/workflow-actions/code/services/code-step-runner.service';

const FLAT_APPLICATION = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  universalIdentifier: 'application-universal-identifier',
} as FlatApplication;

const CODE = 'export const main = async () => ({ value: "{{trigger.name}}" });';

const EXECUTE_RESULT = {
  data: { value: 'ok' },
  logs: '',
  duration: 1,
  billedDurationMs: 1,
  status: LogicFunctionExecutionStatus.SUCCESS,
};

const buildService = async ({
  builtFileExists,
}: {
  builtFileExists: boolean;
}) => {
  const logicFunctionExecutorService = {
    transpile: jest.fn().mockResolvedValue({ builtCode: 'built' }),
    executeBuiltCode: jest.fn().mockResolvedValue(EXECUTE_RESULT),
  };
  const logicFunctionResourceService = {
    builtFileExists: jest.fn().mockResolvedValue(builtFileExists),
    uploadBuiltFile: jest.fn(),
  };
  const cacheLockService = {
    withLock: jest.fn(async (callback: () => Promise<void>) => callback()),
  };

  const testingModule = await Test.createTestingModule({
    providers: [
      CodeStepRunnerService,
      {
        provide: LogicFunctionExecutorService,
        useValue: logicFunctionExecutorService,
      },
      {
        provide: LogicFunctionResourceService,
        useValue: logicFunctionResourceService,
      },
      { provide: CacheLockService, useValue: cacheLockService },
    ],
  }).compile();

  return {
    service: testingModule.get(CodeStepRunnerService),
    logicFunctionExecutorService,
    logicFunctionResourceService,
  };
};

describe('CodeStepRunnerService', () => {
  it('builds the code once and runs the cached build', async () => {
    const {
      service,
      logicFunctionExecutorService,
      logicFunctionResourceService,
    } = await buildService({ builtFileExists: false });

    const result = await service.run({
      flatApplication: FLAT_APPLICATION,
      code: CODE,
      payload: { name: 'Acme' },
    });

    expect(logicFunctionExecutorService.transpile).toHaveBeenCalledWith(
      expect.objectContaining({ sourceCode: CODE }),
    );

    const [{ builtHandlerPath }] =
      logicFunctionResourceService.uploadBuiltFile.mock.calls[0];

    expect(builtHandlerPath).toMatch(
      /^workflow-code-steps\/[0-9a-f]{64}\/index\.mjs$/,
    );
    expect(logicFunctionExecutorService.executeBuiltCode).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        flatApplication: FLAT_APPLICATION,
        builtHandlerPath,
        payload: { name: 'Acme' },
      }),
    );
    expect(result).toBe(EXECUTE_RESULT);
  });

  it('skips the build when the code was already built', async () => {
    const {
      service,
      logicFunctionExecutorService,
      logicFunctionResourceService,
    } = await buildService({ builtFileExists: true });

    await service.run({
      flatApplication: FLAT_APPLICATION,
      code: CODE,
      payload: {},
    });

    expect(logicFunctionExecutorService.transpile).not.toHaveBeenCalled();
    expect(logicFunctionResourceService.uploadBuiltFile).not.toHaveBeenCalled();
    expect(logicFunctionExecutorService.executeBuiltCode).toHaveBeenCalled();
  });

  it('keys the build on the code', async () => {
    const { service } = await buildService({ builtFileExists: true });

    const firstPath = await service.getOrBuild({
      flatApplication: FLAT_APPLICATION,
      code: CODE,
    });
    const samePath = await service.getOrBuild({
      flatApplication: FLAT_APPLICATION,
      code: CODE,
    });
    const otherPath = await service.getOrBuild({
      flatApplication: FLAT_APPLICATION,
      code: `${CODE}\n`,
    });

    expect(samePath).toBe(firstPath);
    expect(otherPath).not.toBe(firstPath);
  });

  it('reports a build failure as an execution error', async () => {
    const { service, logicFunctionExecutorService } = await buildService({
      builtFileExists: false,
    });

    logicFunctionExecutorService.transpile.mockRejectedValue(
      new Error('Unexpected token'),
    );

    const result = await service.run({
      flatApplication: FLAT_APPLICATION,
      code: 'export const main = (',
      payload: {},
    });

    expect(result.status).toBe(LogicFunctionExecutionStatus.ERROR);
    expect(result.error?.errorMessage).toBe('Unexpected token');
    expect(
      logicFunctionExecutorService.executeBuiltCode,
    ).not.toHaveBeenCalled();
  });
});
