export const buildAppleHttpOrigin = (): string => {
  const origin = new URL(`http://localhost:${APP_PORT}`);

  origin.hostname =
    process.env.IS_MULTIWORKSPACE_ENABLED === 'true'
      ? `apple.${origin.hostname}`
      : origin.hostname;

  return origin.origin;
};
