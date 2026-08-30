import { type FieldLinksVariant } from '@/types/FieldMetadataSettings';
import { normalizeDomain } from '@/utils/url/normalizeDomain';
import { normalizeUrlOrigin } from '@/utils/url/normalizeUrlOrigin';

export const getLinkUrlNormalizer = (
  linksVariant: FieldLinksVariant | undefined,
): ((url: string) => string) =>
  linksVariant === 'domain' ? normalizeDomain : normalizeUrlOrigin;
