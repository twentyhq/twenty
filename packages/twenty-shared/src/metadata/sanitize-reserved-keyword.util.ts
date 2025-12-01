import { RESERVED_METADATA_NAME_KEYWORDS } from './reserved-metadata-name-keywords.constant';
import { capitalize } from '../utils';

export const sanitizeReservedKeyword = (name: string): string => {
  if (!name) return name;

  return RESERVED_METADATA_NAME_KEYWORDS.includes(name)
    ? `${name}${capitalize('custom')}`
    : name;
};
