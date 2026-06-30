export type EventStreamMetadataEvent = {
  metadataName: string;
  type: 'created' | 'updated' | 'deleted';
  recordId: string;
  properties: {
    updatedFields?: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
  };
  updatedCollectionHash?: string;
};
