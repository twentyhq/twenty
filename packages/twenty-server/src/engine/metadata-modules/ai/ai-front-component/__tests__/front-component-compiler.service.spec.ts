import { Test } from '@nestjs/testing';
import { Lambda, InvokeCommand } from '@aws-sdk/client-lambda';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { PageLayoutType } from 'twenty-shared/types';
import { FrontComponentCompilerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-compiler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LambdaDependencyLayerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-dependency-layer.service';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util',
);
jest.mock('@aws-sdk/client-lambda', () => ({
  ...jest.requireActual('@aws-sdk/client-lambda'),
  Lambda: jest.fn(),
}));

const input = {
  componentId: 'component',
  name: 'Companies',
  source: 'export const Component = () => <div />;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  pageLayoutType: PageLayoutType.DASHBOARD as const,
};
const vendorChecksum = createHash('sha256').update('vendor').digest('hex');
const vendor = {
  success: true,
  source: 'vendor',
  checksum: vendorChecksum,
  exports: {},
};
const compiledSource =
  '// twenty-ai-shared-dependencies: ' +
  vendorChecksum +
  '\nexport default function() {}';
const built = {
  success: true,
  source: 'saved source',
  componentName: 'Component',
  compiledSource,
  checksum: createHash('sha256').update(compiledSource).digest('hex'),
  sharedDependenciesChecksum: vendorChecksum,
};

describe('FrontComponentCompilerService', () => {
  const send = jest.fn();
  const getConfig = jest.fn();
  let service: FrontComponentCompilerService;
  const dependencies = jest.fn();
  const cache = new Map<string, unknown>();
  const buildCommands = () =>
    send.mock.calls
      .map(([command]: [InvokeCommand]) => command)
      .filter(
        (command) =>
          JSON.parse(String(command.input.Payload)).action === 'buildComponent',
      );
  beforeEach(async () => {
    jest.clearAllMocks();
    cache.clear();
    getConfig.mockReturnValue('LAMBDA');
    jest.mocked(getLambdaConnectionOptions).mockReturnValue({
      region: 'eu-west-1',
      lambdaRole: 'role',
      resourceNamespace: 'instance',
      layerBucket: 'bucket',
      layerBucketRegion: 'eu-west-1',
    });
    jest.spyOn(fs, 'readFile').mockResolvedValue('handler');
    dependencies.mockResolvedValue({
      applicationId: 'custom-app',
      revision: 'revision-a',
      packageJson: 'package',
      yarnLock: 'lock',
    });
    jest
      .spyOn(LambdaDependencyLayerService.prototype, 'ensureLayer')
      .mockImplementation(async ({ layerName }) => `arn:${layerName}`);
    const client = new Lambda({ region: 'eu-west-1' });
    Object.assign(client, { send });
    jest
      .spyOn(LambdaAwsClientService.prototype, 'getLambdaClient')
      .mockResolvedValue(client);
    jest
      .spyOn(LambdaToolFunctionsService.prototype, 'ensureBuilderLambdaExists')
      .mockResolvedValue();
    send.mockImplementation(async (command: InvokeCommand) => ({
      Payload: {
        transformToString: () =>
          JSON.stringify(
            JSON.parse(String(command.input.Payload)).action ===
              'buildDependencies'
              ? vendor
              : built,
          ),
      },
    }));
    const module = await Test.createTestingModule({
      providers: [
        FrontComponentCompilerService,
        {
          provide: WorkspaceFrontComponentDependenciesService,
          useValue: { readOrThrow: dependencies },
        },
        {
          provide: CacheLockService,
          useValue: {
            withLock: (callback: () => Promise<unknown>) => callback(),
          },
        },
        {
          provide: CacheStorageNamespace.ModuleApplications,
          useValue: {
            get: (key: string) => cache.get(key),
            set: (key: string, value: unknown) => cache.set(key, value),
          },
        },
        { provide: TwentyConfigService, useValue: { get: getConfig } },
        {
          provide: ConfigGroupHashService,
          useValue: { computeHash: () => 'config' },
        },
      ],
    }).compile();
    service = module.get(FrontComponentCompilerService);
  });
  afterEach(() => jest.restoreAllMocks());
  it('reuses a workspace builder but separates workspaces, and returns the exact Lambda artifact', async () => {
    const result = await service.build({ workspaceId: 'workspace-a', input });
    await service.build({ workspaceId: 'workspace-a', input });
    await service.build({ workspaceId: 'workspace-b', input });
    const commands = buildCommands();
    expect(commands[0].input.FunctionName).toBe(commands[1].input.FunctionName);
    expect(commands[0].input.FunctionName).not.toBe(
      commands[2].input.FunctionName,
    );
    expect(JSON.parse(String(commands[0].input.Payload)).input).toEqual(input);
    expect(result.compiledSource).toBe(compiledSource);
    expect(result.source).toContain(input.source);
    expect(result.source).not.toBe(built.source);
    expect(result.sharedDependencies.source).toBe('vendor');
    expect(String(commands[0].input.Payload)).not.toContain('package');
    expect(send.mock.calls).toHaveLength(5);
  });
  it.each(['LOCAL', 'DISABLED'])(
    'does not compile locally when the driver is %s',
    async (driver) => {
      getConfig.mockReturnValue(driver);
      await expect(
        service.build({ workspaceId: 'workspace-a', input }),
      ).rejects.toThrow('requires the Lambda');
      expect(send).not.toHaveBeenCalled();
    },
  );
  it('returns authored-code diagnostics to the caller', async () => {
    send.mockResolvedValueOnce({
      Payload: { transformToString: () => JSON.stringify(vendor) },
    });
    send.mockResolvedValue({
      Payload: {
        transformToString: () =>
          JSON.stringify({
            success: false,
            error: 'Unsupported import: node:fs',
          }),
      },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('Unsupported import');
  });
  it.each([
    { checksum: 'b'.repeat(64) },
    { sharedDependenciesChecksum: 'b'.repeat(64) },
  ])('rejects mismatched output or vendor checksums: %s', async (override) => {
    send.mockResolvedValueOnce({
      Payload: { transformToString: () => JSON.stringify(vendor) },
    });
    send.mockResolvedValue({
      Payload: {
        transformToString: () => JSON.stringify({ ...built, ...override }),
      },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('checksum mismatch');
  });
  it('rejects a self-consistent artifact whose vendor banner differs', async () => {
    const wrongVendor = compiledSource.replace(vendorChecksum, 'b'.repeat(64));
    send.mockResolvedValueOnce({
      Payload: { transformToString: () => JSON.stringify(vendor) },
    });
    send.mockResolvedValue({
      Payload: {
        transformToString: () =>
          JSON.stringify({
            ...built,
            compiledSource: wrongVendor,
            checksum: createHash('sha256').update(wrongVendor).digest('hex'),
          }),
      },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('checksum mismatch');
  });
  it('reports infrastructure failures without exposing the Lambda error payload', async () => {
    send.mockResolvedValueOnce({
      Payload: { transformToString: () => JSON.stringify(vendor) },
    });
    send.mockResolvedValue({
      FunctionError: 'Unhandled',
      Payload: { transformToString: () => 'internal details' },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('builder Lambda failed');
  });
  it('builds a new vendor when the app dependency revision changes', async () => {
    await service.build({ workspaceId: 'workspace-a', input });
    dependencies.mockResolvedValue({
      applicationId: 'custom-app',
      revision: 'revision-b',
      packageJson: 'new package',
      yarnLock: 'new lock',
    });
    const result = await service.build({ workspaceId: 'workspace-a', input });
    const commands = buildCommands();
    expect(commands[0].input.FunctionName).not.toBe(
      commands[1].input.FunctionName,
    );
    expect(result.dependencyRevision).toBe('revision-b');
    expect(send.mock.calls).toHaveLength(4);
    const { readDependencies } = jest.mocked(
      LambdaDependencyLayerService.prototype.ensureLayer,
    ).mock.calls[1][0];
    expect(await readDependencies()).toEqual({
      packageJson: 'new package',
      yarnLock: 'new lock',
      installAllDependencies: true,
    });
  });
  it('rejects a corrupt vendor before building authored code', async () => {
    send.mockResolvedValue({
      Payload: {
        transformToString: () =>
          JSON.stringify({ ...vendor, source: 'changed bytes' }),
      },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('checksum mismatch');
    expect(buildCommands()).toHaveLength(0);
  });
});
