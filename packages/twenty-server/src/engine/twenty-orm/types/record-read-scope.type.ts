// An existence read admits the records of a DISCOVERABLE object without a
// grant, but may only reference the fields the object lets be discovered.
export type RecordReadScope = 'content' | 'existence';
