import { VIEW_FAMILY_CACHE_KEY_NAMES } from 'src/engine/metadata-modules/view/constants/view-family-cache-key-names.constant';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const computeViewFamilyVersion = (
  hashes: Partial<Record<WorkspaceCacheKeyName, string>>,
): string => combineCacheHashes(hashes, VIEW_FAMILY_CACHE_KEY_NAMES);
