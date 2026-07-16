import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncGateService {
  isSyncEnabled(
    directusUrl: string | undefined,
    directusApiKey: string | undefined,
  ): boolean {
    if (!directusUrl || !directusApiKey) {
      return false;
    }

    return directusUrl.trim().length > 0 && directusApiKey.trim().length > 0;
  }
}
