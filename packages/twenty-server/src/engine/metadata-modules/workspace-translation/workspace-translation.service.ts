import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getTwentyStandardApplicationIdOrThrow } from 'src/engine/metadata-modules/utils/get-twenty-standard-application-id-or-throw.util';
import { type WorkspaceTranslationBenchEntryDTO } from 'src/engine/metadata-modules/workspace-translation/dtos/workspace-translation-bench-entry.dto';
import { WorkspaceTranslationCacheService } from 'src/engine/metadata-modules/workspace-translation/workspace-translation-cache.service';
import { WorkspaceTranslationEntity } from 'src/engine/metadata-modules/workspace-translation/workspace-translation.entity';

@Injectable()
export class WorkspaceTranslationService {
  constructor(
    // workspaceTranslation is a core table keyed by workspaceId, not a workspace-schema entity.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(WorkspaceTranslationEntity)
    private readonly workspaceTranslationRepository: Repository<WorkspaceTranslationEntity>,
    private readonly workspaceTranslationCacheService: WorkspaceTranslationCacheService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly i18nService: I18nService,
  ) {}

  async getBench({
    workspaceId,
    locale,
  }: {
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<WorkspaceTranslationBenchEntryDTO[]> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatApplicationMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatApplicationMaps',
          ],
        },
      );

    const overrideCatalog =
      await this.workspaceTranslationCacheService.getCatalog({
        workspaceId,
        locale,
      });

    const i18nInstance = this.i18nService.getI18nInstance(locale);
    const standardApplicationId =
      getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);

    // One row per (application, source string): identical labels within an
    // application collapse to a single row, so each row maps to exactly one app.
    const accumulatorByCompositeKey = new Map<
      string,
      { applicationId: string; source: string; usageCount: number }
    >();

    const addSource = (
      applicationId: string,
      source: string | null | undefined,
    ) => {
      if (!isNonEmptyString(source)) {
        return;
      }

      const compositeKey = `${applicationId}:${generateMessageId(source)}`;
      const existing = accumulatorByCompositeKey.get(compositeKey);

      if (isDefined(existing)) {
        existing.usageCount += 1;
      } else {
        accumulatorByCompositeKey.set(compositeKey, {
          applicationId,
          source,
          usageCount: 1,
        });
      }
    };

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      addSource(
        flatObjectMetadata.applicationId,
        flatObjectMetadata.labelSingular,
      );
      addSource(
        flatObjectMetadata.applicationId,
        flatObjectMetadata.labelPlural,
      );
      addSource(
        flatObjectMetadata.applicationId,
        flatObjectMetadata.description,
      );
    }

    for (const flatFieldMetadata of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      addSource(flatFieldMetadata.applicationId, flatFieldMetadata.label);
      addSource(flatFieldMetadata.applicationId, flatFieldMetadata.description);
    }

    // The shipped translation depends on the owning app's catalog (the standard
    // app uses Lingui); resolve each app's catalog once.
    const catalogByApplicationId = new Map<
      string,
      Record<string, string> | undefined
    >();

    const getApplicationCatalog = async (applicationId: string) => {
      if (catalogByApplicationId.has(applicationId)) {
        return catalogByApplicationId.get(applicationId);
      }

      const applicationRegistrationId =
        flatApplicationMaps.byId[applicationId]?.applicationRegistrationId;

      const catalog =
        applicationId !== standardApplicationId &&
        isDefined(applicationRegistrationId)
          ? await this.applicationTranslationCacheService.getCatalog({
              applicationRegistrationId,
              locale,
            })
          : undefined;

      catalogByApplicationId.set(applicationId, catalog);

      return catalog;
    };

    const entries: WorkspaceTranslationBenchEntryDTO[] = [];

    for (const {
      applicationId,
      source,
      usageCount,
    } of accumulatorByCompositeKey.values()) {
      const key = generateMessageId(source);
      const applicationCatalog = await getApplicationCatalog(applicationId);

      entries.push({
        key,
        applicationId,
        source,
        usageCount,
        shipped: translateStandardLabel({
          sourceValue: source,
          isStandardApp: applicationId === standardApplicationId,
          applicationCatalog,
          i18nInstance,
        }),
        override: overrideCatalog[key] ?? null,
      });
    }

    return entries.sort((entryA, entryB) =>
      entryA.source.localeCompare(entryB.source),
    );
  }

  async upsertTranslation({
    workspaceId,
    locale,
    key,
    value,
  }: {
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
    key: string;
    value: string | null;
  }): Promise<void> {
    const existingRow = await this.workspaceTranslationRepository.findOne({
      where: { workspaceId, locale },
    });

    const trimmedValue = value?.trim() ?? '';
    const messages = { ...(existingRow?.messages ?? {}) };

    if (isNonEmptyString(trimmedValue)) {
      messages[key] = trimmedValue;
    } else {
      delete messages[key];
    }

    if (isDefined(existingRow)) {
      await this.workspaceTranslationRepository.update(existingRow.id, {
        messages,
      });
    } else {
      await this.workspaceTranslationRepository.insert({
        workspaceId,
        locale,
        messages,
      });
    }

    await this.workspaceTranslationCacheService.invalidate(workspaceId);
  }
}
