let corsOriginPattern: RegExp | null | undefined;

export const getCorsOriginPattern = (): RegExp | null => {
  if (corsOriginPattern !== undefined) {
    return corsOriginPattern;
  }

  const allowedOriginRegex = process.env.ALLOWED_REQUEST_ORIGIN_REGEX;
  
  if (!allowedOriginRegex) {
    corsOriginPattern = null;
    return corsOriginPattern;
  }

  try {
    corsOriginPattern = new RegExp(allowedOriginRegex);
  } catch (error) {
    const errorMessage = `Invalid CORS origin regex pattern: ${allowedOriginRegex}. Error: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return corsOriginPattern;
};