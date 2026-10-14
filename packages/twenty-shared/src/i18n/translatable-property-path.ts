import { isNonEmptyString } from '@sniptt/guards';

import { isPlainObject } from '../utils/typeguard/isPlainObject';
import { isDefined } from '../utils/validation/isDefined';

const PATH_SEPARATOR = '.';
const ITEM_ID_WILDCARD = '*';

export type TranslatablePropertyPath<TPattern extends string> =
  TPattern extends `${infer THead}*${infer TTail}`
    ? `${THead}${string}${TranslatablePropertyPath<TTail>}`
    : TPattern;

export const buildTranslatablePropertyPath = ({
  pattern,
  itemIds,
}: {
  pattern: string;
  itemIds: string[];
}): string => {
  const remainingItemIds = [...itemIds];

  return pattern
    .split(PATH_SEPARATOR)
    .map((segment) =>
      segment === ITEM_ID_WILDCARD ? (remainingItemIds.shift() ?? '') : segment,
    )
    .join(PATH_SEPARATOR);
};

export const matchTranslatablePropertyPath = ({
  pattern,
  property,
}: {
  pattern: string;
  property: string;
}): string[] | undefined => {
  const patternSegments = pattern.split(PATH_SEPARATOR);
  const propertySegments = property.split(PATH_SEPARATOR);

  if (patternSegments.length !== propertySegments.length) {
    return undefined;
  }

  const itemIds: string[] = [];

  for (const [index, patternSegment] of patternSegments.entries()) {
    const propertySegment = propertySegments[index];

    if (patternSegment === ITEM_ID_WILDCARD) {
      if (!isNonEmptyString(propertySegment)) {
        return undefined;
      }

      itemIds.push(propertySegment);
      continue;
    }

    if (patternSegment !== propertySegment) {
      return undefined;
    }
  }

  return itemIds;
};

const listPathValues = (
  segments: string[],
  value: unknown,
  pathSegments: string[],
): { property: string; value: unknown }[] => {
  const [segment, ...remainingSegments] = segments;

  if (!isDefined(segment)) {
    return [{ property: pathSegments.join(PATH_SEPARATOR), value }];
  }

  if (segment === ITEM_ID_WILDCARD) {
    return Array.isArray(value)
      ? value.flatMap((item) =>
          isPlainObject(item) && isNonEmptyString(item.id)
            ? listPathValues(remainingSegments, item, [
                ...pathSegments,
                item.id,
              ])
            : [],
        )
      : [];
  }

  return isPlainObject(value) && segment in value
    ? listPathValues(remainingSegments, value[segment], [
        ...pathSegments,
        segment,
      ])
    : [];
};

export const listTranslatablePropertyPathValues = ({
  pattern,
  value,
}: {
  pattern: string;
  value: unknown;
}): { property: string; value: unknown }[] =>
  listPathValues(pattern.split(PATH_SEPARATOR), value, []);
