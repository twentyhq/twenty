import { isDefined } from 'twenty-shared/utils';

import { isFlatOverridesBlob } from 'src/engine/metadata-modules/utils/is-flat-overrides-blob.util';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/utils/compute-override-author-order.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/utils/normalize-authored-overrides.util';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isDefined(value) && typeof value === 'object';

export const listAuthoredOverrideEntries = <TEntry>({
  overrides,
  authorContext,
}: {
  overrides: unknown;
  authorContext: OverrideAuthorReadContext;
}): TEntry[] => {
  if (!isRecord(overrides)) {
    return [];
  }

  const {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier,
  } = authorContext;

  if (isDefined(workspaceCustomApplicationUniversalIdentifier)) {
    const authoredOverrides =
      normalizeAuthoredOverrides<TEntry>({
        overrides,
        workspaceCustomApplicationUniversalIdentifier,
      }) ?? {};

    return computeOverrideAuthorOrder({
      workspaceCustomApplicationUniversalIdentifier,
      ownerApplicationUniversalIdentifier,
    })
      .map((author) => authoredOverrides[author])
      .filter(isDefined);
  }

  // A flat blob predates author keys and was written by the custom
  // application, so it reads as the one non-owner entry.
  if (isFlatOverridesBlob(overrides)) {
    return [overrides as TEntry];
  }

  const ownerEntry = isDefined(ownerApplicationUniversalIdentifier)
    ? (overrides[ownerApplicationUniversalIdentifier] as TEntry | undefined)
    : undefined;
  const nonOwnerEntries = Object.entries(overrides)
    .filter(([author]) => author !== ownerApplicationUniversalIdentifier)
    .map(([, entry]) => entry as TEntry);

  return [...nonOwnerEntries, ownerEntry].filter(isDefined);
};
