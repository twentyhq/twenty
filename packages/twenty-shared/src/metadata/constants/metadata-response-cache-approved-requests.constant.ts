export type MetadataResponseCacheApprovedRequest = {
  documentFingerprint: string;
  variables: Record<string, unknown>;
};

export const METADATA_RESPONSE_CACHE_APPROVED_REQUESTS: Record<
  string,
  MetadataResponseCacheApprovedRequest[]
> = {
  ObjectMetadataItems: [
    {
      documentFingerprint:
        '32aa29b16269aeef9196e39fa98dce024ccb42e0d7b394f44f9a196acac38252',
      variables: {},
    },
  ],
  FindAllViews: [
    {
      documentFingerprint:
        '5358c1f53519f800da6357a65edb0301121128a9383fc4fe98b8a9904c7bcf58',
      variables: { viewTypes: ['TABLE', 'KANBAN', 'CALENDAR', 'LIST'] },
    },
  ],
  FindSharedViews: [
    {
      documentFingerprint:
        '7ceeb919ce7e1863fe622165b74a45da0089498aa53aed7e04cc5cbb8fb26a00',
      variables: {
        viewTypes: ['TABLE', 'KANBAN', 'CALENDAR', 'LIST'],
      },
    },
    {
      documentFingerprint:
        '7ceeb919ce7e1863fe622165b74a45da0089498aa53aed7e04cc5cbb8fb26a00',
      variables: {
        viewTypes: ['FIELDS_WIDGET'],
      },
    },
    {
      documentFingerprint:
        '7ceeb919ce7e1863fe622165b74a45da0089498aa53aed7e04cc5cbb8fb26a00',
      variables: {
        viewTypes: [
          'TABLE_WIDGET',
          'KANBAN_WIDGET',
          'LIST_WIDGET',
          'CALENDAR_WIDGET',
        ],
      },
    },
  ],
};
