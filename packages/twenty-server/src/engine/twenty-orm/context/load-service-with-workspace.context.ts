import { Inject, Type } from '@nestjs/common';
import { ModuleRef, createContextId } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';

export class LoadServiceWithWorkspaceContext {
  private readonly injector = new Injector();

  constructor(
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
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

    if (this.moduleRef.registerRequestByContextId) {
      this.moduleRef.registerRequestByContextId(
        { req: { workspaceId } },
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
