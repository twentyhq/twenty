export const ORGANIZATION_LEVEL_VALIDATION_CONSTANTS = {
  LEVEL_CODE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    REGEX: /^[A-Z][A-Z0-9_]*$/,
  },
  LEVEL_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  LEVEL_NAME_EN: {
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  DISPLAY_ORDER: {
    MIN_VALUE: 0,
  },
} as const;
