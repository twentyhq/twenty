// Wrapper type that circumvents the ESM circular dependency caused by
// reflection metadata saving the type of the property.
export type EntityRelation<T> = T;
