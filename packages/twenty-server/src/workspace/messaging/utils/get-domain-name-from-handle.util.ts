export function getDomainNameFromHandle(handle: string): string {
  return handle.split('@')?.[1].split('.').slice(-2).join('.').toLowerCase();
}
