// Type marker for IDs in jsonb columns that reference other metadata entities
// This type helps identify which string properties in settings/configuration
// objects are foreign keys that need special handling during import/export
export type SerializedForeignKey<T> = T;
