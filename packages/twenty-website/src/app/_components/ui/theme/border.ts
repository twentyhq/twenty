import { Color } from './colors';

const common = {
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    xl: '20px',
    pill: '999px',
    rounded: '100%',
  },
};

export const Border = {
  color: {
    plain: Color.gray60,
  },
  ...common,
};
