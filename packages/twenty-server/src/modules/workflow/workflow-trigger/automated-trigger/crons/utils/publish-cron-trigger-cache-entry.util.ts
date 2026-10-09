import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';

export const publishCronTriggerCacheEntry = async ({
  cacheStorageService,
  cachedTrigger,
  logger,
}: {
  cacheStorageService: CacheStorageService;
  cachedTrigger: CachedCronTrigger;
  logger: { error: (message: unknown, ...optionalParams: unknown[]) => void };
}): Promise<void> => {
  try {
    await cacheStorageService.hashSetIfExists({
      key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      field: cachedTrigger.workflowId,
      value: JSON.stringify(cachedTrigger),
    });
  } catch (error) {
    logger.error(
      `Cron trigger cache entry not published for workflow ${cachedTrigger.workflowId}, dropping the cron cache so the next tick rebuilds it from the database`,
      error,
    );

    try {
      await cacheStorageService.del(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
    } catch (invalidationError) {
      logger.error(invalidationError);
    }
  }
};
