import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { doNotTranslate } from 'twenty-shared/i18n';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.schemas';
import {
  buildFrontComponentEntrySource,
  compileFrontComponent,
} from 'src/engine/metadata-modules/ai/ai-front-component/front-component.compiler';

const MAX_CONCURRENT_BUILDS = 2;
const MAX_WORKSPACE_BUILDS_PER_MINUTE = 6;

@Injectable()
export class AiFrontComponentBuildService {
  private activeBuilds = 0;

  constructor(
    private readonly locks: CacheLockService,
    private readonly throttler: ThrottlerService,
  ) {}

  async build({
    workspaceId,
    componentId,
    input,
  }: {
    workspaceId: string;
    componentId: string;
    input: FrontComponentDraftInput;
  }) {
    if (this.activeBuilds >= MAX_CONCURRENT_BUILDS) {
      throw new ServiceUnavailableException(
        doNotTranslate('Component builder is busy. Please retry shortly.'),
      );
    }
    this.activeBuilds += 1;

    try {
      return await this.locks.withLock(
        async () => {
          await this.throttler.tokenBucketThrottleOrThrow(
            `ai-front-component-build:${workspaceId}`,
            1,
            MAX_WORKSPACE_BUILDS_PER_MINUTE,
            60000,
          );
          const entry = await buildFrontComponentEntrySource({
            componentId,
            name: input.name,
            source: input.source,
            query: input.query,
            pageLayoutType: input.pageLayoutType,
          });
          const compiled = await compileFrontComponent(entry.source);

          return { ...compiled, ...entry };
        },
        `ai-front-component-build:${workspaceId}`,
        { maxRetries: 1, ms: 0, ttl: 30000 },
      );
    } catch (error) {
      if (
        error instanceof CacheLockException &&
        error.code === CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT
      ) {
        throw new ServiceUnavailableException(
          doNotTranslate(
            'A component is already building in this workspace. Please retry shortly.',
          ),
        );
      }
      throw error;
    } finally {
      this.activeBuilds -= 1;
    }
  }
}
