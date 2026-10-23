import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';

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
      const link = lowercased
        .replace(/[?#].*$/, '')
        .replace(/^([a-z][a-z0-9+.-]*:\/\/)?(www\.)?/, '')
        .replace(/\/+$/, '');

      return isNonEmptyString(link) ? link : null;
    }
  }
};
