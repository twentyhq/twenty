export type WorkspaceBroadcastEvent = {
  type: 'created' | 'updated' | 'deleted';
  entityName: string;
  recordId: string;
  properties: {
    updatedFields?: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
  };
};
