import { isDefined } from 'twenty-shared/utils';

import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { isLegacyNonAuthoredOverride } from 'src/engine/metadata-modules/overrides/utils/is-legacy-non-authored-override.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isDefined(value) && typeof value === 'object';

const listAuthoredOverrideEntries = ({
  overrides,
  authorContext,
}: {
  overrides: unknown;
  authorContext: OverrideAuthorReadContext;
}): unknown[] => {
  if (!isRecord(overrides)) {
    return [];
  }

  const {
    workspaceCustomApplicationUniversalIdentifier,
    ownerApplicationUniversalIdentifier,
  } = authorContext;

  if (isDefined(workspaceCustomApplicationUniversalIdentifier)) {
    const authoredOverrides =
      normalizeAuthoredOverrides<unknown>({
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

  // A legacy non-authored override predates author keys and was written by
  // the custom application, so it reads as the one non-owner entry.
  if (isLegacyNonAuthoredOverride(overrides)) {
    return [overrides];
  }

  const ownerEntry = isDefined(ownerApplicationUniversalIdentifier)
    ? overrides[ownerApplicationUniversalIdentifier]
    : undefined;
  const nonOwnerEntries = Object.entries(overrides)
    .filter(([author]) => author !== ownerApplicationUniversalIdentifier)
    .map(([, entry]) => entry);

  return [...nonOwnerEntries, ownerEntry].filter(isDefined);
};

const readPath = (value: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>(
    (current, key) => (isRecord(current) ? current[key] : undefined),
    value,
  );

// The first author in order that carries the path wins, null included: a null
// override is an explicit value, only an absent key falls through. The path is
// a property name, or ['translations', locale, property] for a translation.
export const readAuthoredOverrideProperty = ({
  overrides,
  path,
  authorContext,
}: {
  overrides: unknown;
  path: readonly string[];
  authorContext: OverrideAuthorReadContext;
}): unknown =>
  listAuthoredOverrideEntries({ overrides, authorContext })
    .map((entry) => readPath(entry, path))
    .find((value) => value !== undefined);
