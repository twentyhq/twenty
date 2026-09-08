const SEARCHABLE_SERVER_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;

export function isSearchableServerId(serverId: unknown): serverId is string {
  return (
    typeof serverId === 'string' && SEARCHABLE_SERVER_ID_PATTERN.test(serverId)
  );
}
