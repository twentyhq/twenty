import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyString } from 'twenty-shared/utils';

import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

// mirrored in SQL by add-person-handle-filters-to-query-builder.util.ts; the two must stay equivalent
export const canonicalizePersonHandle = ({
  type,
  value,
}: {
  type: PersonHandleField['type'];
  value: string | null | undefined;
}): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const lowercased = value.trim().toLowerCase();

  switch (type) {
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.TEXT:
      return isNonEmptyString(lowercased) ? lowercased : null;
    case FieldMetadataType.PHONES: {
      const digits = value.replace(/[^0-9]/g, '');

      return isNonEmptyString(digits) ? `+${digits}` : null;
    }
    case FieldMetadataType.LINKS: {
      // the query can carry the identity (profile.php?id=...), so it is kept as typed
      const [location, ...queryParts] = value
        .trim()
        .replace(/#.*$/, '')
        .split('?');
      const query = queryParts.join('?');
      const link = location
        .toLowerCase()
        .replace(/^([a-z][a-z0-9+.-]*:\/\/)?(www\.)?/, '')
        .replace(/\/+$/, '');

      if (!isNonEmptyString(link)) {
        return null;
      }

      return isNonEmptyString(query) ? `${link}?${query}` : link;
    }
  }
};
