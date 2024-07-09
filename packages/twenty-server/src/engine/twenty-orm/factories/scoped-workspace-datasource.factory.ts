import { Inject, Injectable, Optional, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ScopedWorkspaceIdFactory {
  constructor(
    @Optional()
    @Inject(REQUEST)
    private readonly request: Request | null,
  ) {}

  public create(): string | null {
    const workspaceId: string | undefined =
      this.request?.['req']?.['workspaceId'];

    return workspaceId ?? null;
  }
}
