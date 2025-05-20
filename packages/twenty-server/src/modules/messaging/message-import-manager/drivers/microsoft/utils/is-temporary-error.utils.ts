export const isMicrosoftClientTemporaryError = (body: string): boolean => {
  return (
    body.includes('Unexpected token < in JSON at position') ||
    body.includes('ApplicationThrottled 429 error')
  );
};
