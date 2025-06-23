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
    userWorkspaceId: string | null;
    isExecutedByApiKey: boolean;
  } {
    const workspaceId: string | undefined =
      // @ts-expect-error legacy noImplicitAny
      this.request?.['req']?.['workspaceId'] ||
      // @ts-expect-error legacy noImplicitAny
      this.request?.['params']?.['workspaceId'] ||
      // @ts-expect-error legacy noImplicitAny
      this.request?.['workspace']?.['id']; // rest api

    return {
      workspaceId: workspaceId ?? null,
      userWorkspaceId:
        // @ts-expect-error legacy noImplicitAny
        this.request?.['req']?.['userWorkspaceId'] ??
        // @ts-expect-error legacy noImplicitAny
        this.request?.['userWorkspaceId'] ?? // rest api
        null,
      isExecutedByApiKey: !!(
        // @ts-expect-error legacy noImplicitAny
        (this.request?.['req']?.['apiKey'] || this.request?.['apiKey'])
      ),
    };
  }
}
