import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ScopedWorkspaceContextFactory {
  constructor(
    @Optional()
    @Inject(REQUEST)
    private readonly request: Request | null,
  ) {}

  public create(): {
    workspaceId: string | null;
    cacheVersion: string | null;
  } {
    const workspaceId: string | undefined =
      this.request?.['req']?.['workspaceId'];
    const cacheVersion: string | undefined =
      this.request?.['req']?.['cacheVersion'];

    return {
      workspaceId: workspaceId ?? null,
      cacheVersion: cacheVersion ?? null,
    };
  }
}
