// Keys standard flags held before 2.53. They stay reserved: stale clients still
// send them and reverting the 2-53 rename restores them.
export const LEGACY_STANDARD_PERMISSION_FLAG_KEYS = [
  'CONNECTED_ACCOUNTS',
  'APPLICATIONS',
] as const;
