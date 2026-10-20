import { isNonEmptyString } from '@sniptt/guards';

import { FIELD_TYPE_DEFAULT_ICONS } from '@/constants';
import { type FieldMetadataType } from '@/types';

export const getFieldIconOrTypeDefault = ({
  icon,
  type,
}: {
  icon?: string | null;
  type: `${FieldMetadataType}`;
}): string => {
  const trimmedIcon = icon?.trim();

  return isNonEmptyString(trimmedIcon)
    ? trimmedIcon
    : FIELD_TYPE_DEFAULT_ICONS[type];
};
