type ImageAbsoluteURI<T extends string | null | undefined> = T extends string
  ? string
  : null;

export const getImageAbsoluteURI = <T extends string | null | undefined>(
  imageUrl: T,
  serverUrl: string,
): ImageAbsoluteURI<T> => {
  if (imageUrl == null || imageUrl.length === 0 || serverUrl.length === 0) {
    return null as ImageAbsoluteURI<T>;
  }

  if (imageUrl.startsWith('https:') || imageUrl.startsWith('http:')) {
    return imageUrl as ImageAbsoluteURI<T>;
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

  return fullUrl.toString() as ImageAbsoluteURI<T>;
};
