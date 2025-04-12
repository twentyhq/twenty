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
  } {
    const workspaceId: string | undefined =
      this.request?.['req']?.['workspaceId'] ||
      this.request?.['params']?.['workspaceId'];
    const workspaceMetadataVersion: number | undefined =
      this.request?.['req']?.['workspaceMetadataVersion'];

    return {
      workspaceId: workspaceId ?? null,
      workspaceMetadataVersion: workspaceMetadataVersion ?? null,
      userWorkspaceId: this.request?.['req']?.['userWorkspaceId'] ?? null,
    };
  }
}
