export const getImageAbsoluteURI = (
  imageUrl: string | null | undefined,
  serverUrl: string | null | undefined,
): string | null => {
  if (!imageUrl || !serverUrl) {
    return null;
  }

  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl;
  }

  const baseUrl = new URL(serverUrl);

  let fullUrl: URL;
  if (imageUrl.startsWith('/')) {
    // Append the `/files/` prefix to paths starting with `/`
    fullUrl = new URL(`/files${imageUrl}`, baseUrl.origin);
  } else {
    // Treat as a relative path under `/files/`
    fullUrl = new URL(imageUrl, `${baseUrl.origin}/files/`);
  }

  return fullUrl.toString();
};
