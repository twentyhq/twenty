import { isNonEmptyString } from '@sniptt/guards';
import { FIELD_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { type FieldMetadataType } from 'twenty-shared/types';

export const getFieldIconOrTypeDefault = ({
  icon,
  type,
}: {
  icon?: string | null;
  type: FieldMetadataType;
}): string => (isNonEmptyString(icon) ? icon : FIELD_TYPE_DEFAULT_ICONS[type]);
