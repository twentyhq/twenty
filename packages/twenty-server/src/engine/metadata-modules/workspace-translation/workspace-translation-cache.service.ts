import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { Repository } from 'typeorm';

import { WorkspaceTranslationEntity } from 'src/engine/metadata-modules/workspace-translation/workspace-translation.entity';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type WorkspaceCatalogsByLocale = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string>>
>;

const CACHE_TTL_MS = 30_000;

const EMPTY_CATALOG: Record<string, string> = {};

@Injectable()
export class WorkspaceTranslationCacheService {
  private readonly catalogsMemoizer =
    new PromiseMemoizer<WorkspaceCatalogsByLocale>(CACHE_TTL_MS);

  constructor(
    // workspaceTranslation is a core table keyed by workspaceId, but it is not a
    // workspace-schema entity, so the workspace-scoped repository rule does not apply.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(WorkspaceTranslationEntity)
    private readonly workspaceTranslationRepository: Repository<WorkspaceTranslationEntity>,
  ) {}

  async getCatalog({
    workspaceId,
    locale,
  }: {
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<Record<string, string>> {
    const catalogsByLocale =
      await this.catalogsMemoizer.memoizePromiseAndExecute(
        this.getCacheKey(workspaceId),
        () => this.loadCatalogsByLocale(workspaceId),
      );

    return catalogsByLocale?.[locale] ?? EMPTY_CATALOG;
  }

  async invalidate(workspaceId: string): Promise<void> {
    await this.catalogsMemoizer.clearKeys(this.getCacheKey(workspaceId));
  }

  private getCacheKey(workspaceId: string): CacheKey {
    return `workspaceTranslation-${workspaceId}`;
  }

  private async loadCatalogsByLocale(
    workspaceId: string,
  ): Promise<WorkspaceCatalogsByLocale> {
    const rows = await this.workspaceTranslationRepository.find({
      where: { workspaceId },
    });

    const catalogsByLocale: WorkspaceCatalogsByLocale = {};

    for (const row of rows) {
      catalogsByLocale[row.locale] = row.messages;
    }

    return catalogsByLocale;
  }
}
