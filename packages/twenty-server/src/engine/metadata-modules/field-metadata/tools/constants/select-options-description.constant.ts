import {
  DEFAULT_SELECT_OPTION_COLOR,
  TAG_COLORS,
} from 'twenty-shared/constants';

export const SELECT_OPTIONS_DESCRIPTION = `SELECT/MULTI_SELECT options: [{ label, value, position, color }]. color is one of ${TAG_COLORS.join(', ')}; defaults to ${DEFAULT_SELECT_OPTION_COLOR} when omitted.`;
