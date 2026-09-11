import { type AllMetadataName } from 'twenty-shared/metadata';
import { fastDeepEqual } from 'twenty-shared/utils';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';

import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';
import { type OverrideAuthorContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type DispatchUpdateToAuthoredOverrideArgs<TProperties extends object> = {
  metadataName: AllMetadataName;
  updatedProperties: TProperties;
  existingEntity: object;
  existingOverrides: unknown;
  authorUniversalIdentifier: string;
  authorContext: OverrideAuthorContext;
};

const isEmptyRecord = (record: object): boolean =>
  Object.keys(record).length === 0;

export const dispatchUpdateToAuthoredOverride = <
  TProperties extends object,
  TEntry = Record<string, unknown>,
>({
  metadataName,
  updatedProperties,
  existingEntity,
  existingOverrides,
  authorUniversalIdentifier,
  authorContext,
}: DispatchUpdateToAuthoredOverrideArgs<TProperties>): {
  overrides: AuthoredOverrides<TEntry> | null;
  columnProperties: TProperties;
} => {
  const columnRecord: Record<string, unknown> = {
    ...(updatedProperties as unknown as Record<string, unknown>),
  };
  const existingRecord = existingEntity as Record<string, unknown>;
  const overridableProperties: readonly string[] =
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName];

  const authoredOverrides =
    normalizeAuthoredOverrides<Record<string, unknown>>({
      metadataName,
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
      metadataName,
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
      if (columnRecord[property] === undefined) {
        return entry;
      }

      const propertyValue = columnRecord[property];

      delete columnRecord[property];

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
    columnProperties: columnRecord as unknown as TProperties,
  };
};
