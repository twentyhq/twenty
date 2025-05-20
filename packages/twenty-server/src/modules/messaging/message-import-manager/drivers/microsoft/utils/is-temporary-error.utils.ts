export const isMicrosoftClientTemporaryError = (body: string): boolean => {
  const isTemporaryError =
    body.includes('Unexpected token < in JSON at position') ||
    body.includes(`ApplicationThrottled 429 error`);

  if (isTemporaryError) {
    return true;
  }

  return false;
};
