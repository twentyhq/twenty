import { Inject, Type } from '@nestjs/common';
import { ModuleRef, createContextId } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';

import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

export class LoadServiceWithWorkspaceContext {
  private readonly injector = new Injector();

  constructor(
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {}

  async load<T>(service: T, workspaceId: string): Promise<T> {
    const modules = this.moduleRef['container'].getModules();
    const host = [...modules.values()].find((module) =>
      module.providers.has((service as Type<T>).constructor),
    );

    if (!host) {
      throw new Error('Host module not found for the service');
    }

    const contextId = createContextId();
    const cacheVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    if (this.moduleRef.registerRequestByContextId) {
      this.moduleRef.registerRequestByContextId(
        { req: { workspaceId, cacheVersion } },
        contextId,
      );
    }

    return this.injector.loadPerContext(
      service,
      host,
      new Map(host.providers),
      contextId,
    );
  }
}
