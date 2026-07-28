import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ViewKey } from '@/types/ViewKey';

// A system view is an object's singleton engine-owned view (e.g. the INDEX
// main table view); its name is server-generated, so it is keyed by its stable
// view key rather than its name.
export const getSystemViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  viewKey,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  viewKey: ViewKey;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${viewKey}`,
    applicationUniversalIdentifier,
  });
