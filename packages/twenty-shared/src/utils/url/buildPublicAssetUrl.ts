const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

export const buildPublicAssetUrl = ({
  path,
  serverUrl,
  workspaceId,
  applicationId,
}: {
  path: string | null | undefined;
  serverUrl: string;
  workspaceId: string;
  applicationId: string;
}): string | null => {
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;

  return `${baseUrl}/public-assets/${workspaceId}/${applicationId}/${path}`;
};
