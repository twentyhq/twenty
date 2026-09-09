import { fastDeepEqual } from 'twenty-shared/utils';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type ComputeMetadataOverridesBlobArgs<TProperties extends object> = {
  overridableProperties: readonly string[];
  updatedProperties: TProperties;
  existingEntity: object;
  existingOverrides: unknown;
  authorUniversalIdentifier: string;
  authorContext: OverrideAuthorContext;
};

const isEmptyRecord = (record: object): boolean =>
  Object.keys(record).length === 0;

// Writes only the author's entry. A value that equals what the author would
// see without its entry (the entries beneath it, then the base column) is a
// revert, so the property leaves the entry instead of being stored again.
export const computeMetadataOverridesBlob = <
  TProperties extends object,
  TEntry = Record<string, unknown>,
>({
  overridableProperties,
  updatedProperties,
  existingEntity,
  existingOverrides,
  authorUniversalIdentifier,
  authorContext,
}: ComputeMetadataOverridesBlobArgs<TProperties>): {
  overrides: AuthoredOverrides<TEntry> | null;
  remainingProperties: TProperties;
} => {
  const remainingRecord: Record<string, unknown> = {
    ...(updatedProperties as unknown as Record<string, unknown>),
  };
  const existingRecord = existingEntity as Record<string, unknown>;

  const authoredOverrides =
    normalizeAuthoredOverrides<Record<string, unknown>>({
      overrides: existingOverrides,
      workspaceCustomApplicationUniversalIdentifier:
        authorContext.workspaceCustomApplicationUniversalIdentifier,
    }) ?? {};

  const authorOrder = computeOverrideAuthorOrder(authorContext);
  const authorIndex = authorOrder.indexOf(authorUniversalIdentifier);
  const beneathOverrides = Object.fromEntries(
    Object.entries(authoredOverrides).filter(
      ([author]) =>
        authorIndex !== -1 && authorOrder.indexOf(author) > authorIndex,
    ),
  );

  const readBeneathValue = (property: string): unknown => {
    const beneathValue = readAuthoredOverrideProperty({
      overrides: beneathOverrides,
      path: [property],
      authorContext,
    });

    if (beneathValue !== undefined) {
      return beneathValue;
    }

    return existingRecord[property];
  };

  const authorEntry = overridableProperties.reduce<Record<string, unknown>>(
    (entry, property) => {
      if (remainingRecord[property] === undefined) {
        return entry;
      }

      const propertyValue = remainingRecord[property];

      delete remainingRecord[property];

      if (fastDeepEqual(propertyValue, readBeneathValue(property))) {
        const { [property]: _revertedProperty, ...restEntry } = entry;

        return restEntry;
      }

      return { ...entry, [property]: propertyValue };
    },
    { ...(authoredOverrides[authorUniversalIdentifier] ?? {}) },
  );

  const { [authorUniversalIdentifier]: _previousEntry, ...otherEntries } =
    authoredOverrides;
  const nextAuthoredOverrides = isEmptyRecord(authorEntry)
    ? otherEntries
    : { ...otherEntries, [authorUniversalIdentifier]: authorEntry };
  const overrides = isEmptyRecord(nextAuthoredOverrides)
    ? null
    : (nextAuthoredOverrides as AuthoredOverrides<TEntry>);

  return {
    overrides,
    remainingProperties: remainingRecord as unknown as TProperties,
  };
};
