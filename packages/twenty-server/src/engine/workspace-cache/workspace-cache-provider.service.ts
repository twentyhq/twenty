import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class WorkspaceCacheProvider<T> {
  abstract computeForCache(workspaceId: string): Promise<T>;
}
