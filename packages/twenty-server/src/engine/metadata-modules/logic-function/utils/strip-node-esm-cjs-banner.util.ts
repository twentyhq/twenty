import { NODE_ESM_CJS_BANNER } from 'twenty-shared/application';

const BANNER_LINE = `${NODE_ESM_CJS_BANNER.js}\n`;

export const stripNodeEsmCjsBanner = (builtCode: string): string => {
  if (!builtCode.startsWith(BANNER_LINE)) {
    return builtCode;
  }

  return builtCode.slice(BANNER_LINE.length);
};
