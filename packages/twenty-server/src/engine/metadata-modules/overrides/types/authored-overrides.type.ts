// One entry per application that authored an override, keyed by that
// application's universal identifier. Readers resolve entries in author order:
// the workspace custom application, then the owning application, then the base
// column.
export type AuthoredOverrides<TEntry> = Partial<Record<string, TEntry>>;
