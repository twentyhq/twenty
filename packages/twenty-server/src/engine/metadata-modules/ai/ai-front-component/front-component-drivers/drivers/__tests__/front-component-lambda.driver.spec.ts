import {
  GetFunctionCommand,
  InvokeCommand,
  Lambda,
  type State,
  UpdateFunctionConfigurationCommand,
  waitUntilFunctionActiveV2,
} from '@aws-sdk/client-lambda';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { FrontComponentLambdaDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/drivers/front-component-lambda.driver';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/utils/get-front-component-builder-name.util',
  () => ({ getFrontComponentBuilderName: async () => 'workspace-builder' }),
);

jest.useRealTimers();

const REQUEST = {
  workspaceId: 'workspace',
  packageJson: '{"name":"fixture","private":true}',
  yarnLock: '# fixture lockfile',
};
const RESULT = {
  success: false,
  code: 'BUILD_FAILED',
  error: 'Build diagnostic',
};

describe('FrontComponentLambdaDriver', () => {
  let state: State;
  let updateError: Error | undefined;
  let commands: string[];
  let payloads: unknown[];
  let driver: FrontComponentLambdaDriver;
  let client: Lambda;

  beforeEach(() => {
    state = 'Inactive';
    updateError = undefined;
    commands = [];
    payloads = [];
    client = new Lambda({ region: 'eu-west-1' });
    let isLocked = false;
    const cacheStorageService = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      acquireLock: async () => {
        if (isLocked) return undefined;
        isLocked = true;
        return 'owner';
      },
      releaseLock: async () => {
        isLocked = false;
      },
      extendLock: async () => true,
    } as unknown as CacheStorageService;

    const send = jest.spyOn(
      client as {
        send(
          command:
            | GetFunctionCommand
            | UpdateFunctionConfigurationCommand
            | InvokeCommand,
        ): Promise<unknown>;
      },
      'send',
    );

    send.mockImplementation(async (command) => {
      commands.push(command.constructor.name);
      if (command instanceof GetFunctionCommand) {
        const response = { Configuration: { State: state }, $metadata: {} };
        if (state === 'Pending') state = 'Active';
        return response;
      }
      if (command instanceof UpdateFunctionConfigurationCommand) {
        if (updateError) throw updateError;
        state = 'Pending';
        return { State: state, $metadata: {} };
      }
      if (command instanceof InvokeCommand) {
        expect(state).toBe('Active');
        payloads.push(JSON.parse(String(command.input.Payload)));
        return {
          Payload: { transformToString: () => JSON.stringify(RESULT) },
          $metadata: {},
        };
      }
      throw new Error('Unexpected Lambda command');
    });
    jest
      .spyOn(LambdaAwsClientService.prototype, 'getLambdaClient')
      .mockResolvedValue(client);
    jest
      .spyOn(LambdaAwsClientService.prototype, 'waitFunctionActive')
      .mockImplementation(async (functionName) => {
        await waitUntilFunctionActiveV2(
          { client, maxWaitTime: 1, minDelay: 0.01, maxDelay: 0.01 },
          { FunctionName: functionName },
        );
      });
    driver = new FrontComponentLambdaDriver({
      region: 'eu-west-1',
      layerBucket: 'fixture',
      layerBucketRegion: 'eu-west-1',
      resourceNamespace: 'fixture',
      lambdaRole: 'fixture',
      cacheStorageService,
      cacheLockService: new CacheLockService(cacheStorageService),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    client.destroy();
  });

  it('reactivates an idle builder before sending the build exactly once', async () => {
    await expect(driver.buildDependencies(REQUEST)).resolves.toEqual(RESULT);

    expect(
      commands.filter(
        (command) => command === 'UpdateFunctionConfigurationCommand',
      ),
    ).toHaveLength(1);
    expect(payloads).toEqual([
      {
        action: 'buildDependencies',
        packageJson: REQUEST.packageJson,
        yarnLock: REQUEST.yarnLock,
      },
    ]);
  });

  it('reactivates once for concurrent builds', async () => {
    await Promise.all([
      driver.buildDependencies(REQUEST),
      driver.buildDependencies(REQUEST),
    ]);

    expect(
      commands.filter(
        (command) => command === 'UpdateFunctionConfigurationCommand',
      ),
    ).toHaveLength(1);
    expect(payloads).toHaveLength(2);
  });

  it.each(['Active', 'Pending'] as const)(
    'reuses a %s builder without updating it',
    async (initialState) => {
      state = initialState;

      await expect(driver.buildDependencies(REQUEST)).resolves.toEqual(RESULT);
      expect(commands).not.toContain('UpdateFunctionConfigurationCommand');
      expect(payloads).toHaveLength(1);
    },
  );

  it('does not invoke a builder whose reactivation failed', async () => {
    updateError = new Error('Access denied');

    await expect(driver.buildDependencies(REQUEST)).rejects.toBe(updateError);
    expect(payloads).toHaveLength(0);
  });

  it('does not invoke or update a failed builder', async () => {
    state = 'Failed';

    await expect(driver.buildDependencies(REQUEST)).rejects.toThrow();
    expect(commands).not.toContain('UpdateFunctionConfigurationCommand');
    expect(payloads).toHaveLength(0);
  });
});
