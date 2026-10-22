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
import { getFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util',
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util',
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
const compiledSource =
  '// twenty-ai-shared-dependencies: ' +
  'a'.repeat(64) +
  '\nexport default function() {}';
const vendorChecksum = 'a'.repeat(64);
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
  beforeEach(async () => {
    jest.clearAllMocks();
    getConfig.mockReturnValue('LAMBDA');
    jest.mocked(getLambdaConnectionOptions).mockReturnValue({
      region: 'eu-west-1',
      lambdaRole: 'role',
      resourceNamespace: 'instance',
      layerBucket: 'bucket',
      layerBucketRegion: 'eu-west-1',
    });
    jest.spyOn(fs, 'readFile').mockResolvedValue('handler');
    jest.mocked(getFrontComponentSharedDependencies).mockResolvedValue({
      source: 'vendor',
      checksum: vendorChecksum,
      exportNamesBySpecifier: new Map(),
    });
    const client = new Lambda({ region: 'eu-west-1' });
    Object.assign(client, { send });
    jest
      .spyOn(LambdaAwsClientService.prototype, 'getLambdaClient')
      .mockResolvedValue(client);
    jest
      .spyOn(LambdaToolFunctionsService.prototype, 'ensureBuilderLambdaExists')
      .mockResolvedValue();
    send.mockResolvedValue({
      Payload: { transformToString: () => JSON.stringify(built) },
    });
    const module = await Test.createTestingModule({
      providers: [
        FrontComponentCompilerService,
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
    const commands: InvokeCommand[] = send.mock.calls.map(
      ([command]) => command,
    );
    expect(commands[0].input.FunctionName).toBe(commands[1].input.FunctionName);
    expect(commands[0].input.FunctionName).not.toBe(
      commands[2].input.FunctionName,
    );
    expect(commands[0].input.Payload).toBe(JSON.stringify(input));
    expect(result.compiledSource).toBe(compiledSource);
    expect(result.source).toContain(input.source);
    expect(result.source).not.toBe(built.source);
    expect(result.sharedDependencies.source).toBe('vendor');
    expect(String(commands[0].input.Payload)).not.toContain('vendor');
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
    const wrongVendor = compiledSource.replace('a'.repeat(64), 'b'.repeat(64));
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
    send.mockResolvedValue({
      FunctionError: 'Unhandled',
      Payload: { transformToString: () => 'internal details' },
    });
    await expect(
      service.build({ workspaceId: 'workspace-a', input }),
    ).rejects.toThrow('builder Lambda failed');
  });
});
