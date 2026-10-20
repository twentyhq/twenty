import { PageLayoutType } from 'twenty-shared/types';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { AiFrontComponentBuildService } from '../ai-front-component-build.service';
import {
  buildFrontComponentEntrySource,
  compileFrontComponent,
} from '../front-component.compiler';

jest.mock('../front-component.compiler');
jest.mock('src/engine/core-modules/cache-lock/cache-lock.service', () => ({
  CacheLockService: class {},
}));
jest.mock('src/engine/core-modules/throttler/throttler.service', () => ({
  ThrottlerService: class {},
}));

const INPUT = {
  pageLayoutType: PageLayoutType.DASHBOARD as const,
  name: 'Companies',
  source: 'export default () => <div />',
  query: { objectName: 'company', select: ['name'], limit: 10 },
  sampleRecords: [],
};
const COMPILED = { compiledSource: 'bundle', checksum: 'checksum' };

describe('component build admission', () => {
  const activeKeys = new Set<string>();
  const locks = {
    withLock: jest.fn(async (callback: () => Promise<unknown>, key: string) => {
      if (activeKeys.has(key)) {
        throw new CacheLockException(
          'Already building',
          CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT,
        );
      }
      activeKeys.add(key);
      try {
        return await callback();
      } finally {
        activeKeys.delete(key);
      }
    }),
  };
  const throttler = { tokenBucketThrottleOrThrow: jest.fn() };
  const makeService = (): AiFrontComponentBuildService =>
    Reflect.construct(AiFrontComponentBuildService, [locks, throttler]);
  let service: AiFrontComponentBuildService;

  beforeEach(() => {
    jest.clearAllMocks();
    activeKeys.clear();
    throttler.tokenBucketThrottleOrThrow.mockResolvedValue(undefined);
    jest.mocked(buildFrontComponentEntrySource).mockResolvedValue({
      source: 'entry',
      componentName: 'Companies',
    });
    jest.mocked(compileFrontComponent).mockResolvedValue(COMPILED);
    service = makeService();
  });

  const build = (workspaceId: string, builder = service) =>
    builder.build({ workspaceId, componentId: 'component', input: INPUT });

  it('rejects excess concurrent work without queuing more compilers', async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    jest.mocked(compileFrontComponent).mockImplementation(async () => {
      await pending;
      return COMPILED;
    });
    const first = build('first');
    const second = build('second');

    await expect(build('third')).rejects.toThrow('builder is busy');
    release();
    await Promise.all([first, second]);
    await expect(build('third')).resolves.toMatchObject(COMPILED);
  });

  it('rejects a concurrent build for the same workspace across service instances', async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    jest.mocked(compileFrontComponent).mockImplementationOnce(async () => {
      await pending;
      return COMPILED;
    });
    const first = build('workspace');
    const anotherInstance = makeService();

    await expect(build('workspace', anotherInstance)).rejects.toThrow(
      'already building in this workspace',
    );
    release();
    await first;
    await expect(build('workspace', anotherInstance)).resolves.toMatchObject(
      COMPILED,
    );
  });

  it('does not start compilation after the workspace rate limit is exhausted', async () => {
    throttler.tokenBucketThrottleOrThrow.mockRejectedValueOnce(
      new ThrottlerException(
        'Rate limit',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await expect(build('workspace')).rejects.toThrow('Rate limit');
    expect(buildFrontComponentEntrySource).not.toHaveBeenCalled();
    await expect(build('workspace')).resolves.toMatchObject(COMPILED);
  });

  it('releases workspace and process capacity after a failed build', async () => {
    jest
      .mocked(compileFrontComponent)
      .mockRejectedValueOnce(new Error('Build exceeded time limit'));

    await expect(build('workspace')).rejects.toThrow('time limit');
    await expect(build('workspace')).resolves.toMatchObject(COMPILED);
    expect(activeKeys.size).toBe(0);
  });
});
