const DATA_URI_PATTERN = /url\(data:([^,)]*),[^)]*\)/g;

export const formatDocumentationTokenValue = (value: string): string =>
  value.replace(DATA_URI_PATTERN, 'url(data:$1,...)');
