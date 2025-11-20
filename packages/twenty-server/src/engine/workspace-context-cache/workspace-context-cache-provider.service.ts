import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class WorkspaceContextCacheProvider<T> {
  abstract computeForCache(workspaceId: string): Promise<T>;
  abstract dataCacheKey(workspaceId: string): string;
  abstract hashCacheKey(workspaceId: string): string;
}
