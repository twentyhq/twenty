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
    workspaceMetadataVersion: number | null;
    userWorkspaceId: string | null;
    isExecutedByApiKey: boolean;
  } {
    const workspaceId: string | undefined =
      // @ts-expect-error legacy noImplicitAny
      this.request?.['req']?.['workspaceId'] ||
      // @ts-expect-error legacy noImplicitAny
      this.request?.['params']?.['workspaceId'];
    const workspaceMetadataVersion: number | undefined =
      // @ts-expect-error legacy noImplicitAny
      this.request?.['req']?.['workspaceMetadataVersion'];

    return {
      workspaceId: workspaceId ?? null,
      workspaceMetadataVersion: workspaceMetadataVersion ?? null,
      // @ts-expect-error legacy noImplicitAny
      userWorkspaceId: this.request?.['req']?.['userWorkspaceId'] ?? null,
      // @ts-expect-error legacy noImplicitAny
      isExecutedByApiKey: !!this.request?.['req']?.['apiKey'],
    };
  }
}
