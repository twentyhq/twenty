export function stripUrlProtocol(url: string): string {
  return url.replace(/(^\w+:|^)\/\//, '');
}
