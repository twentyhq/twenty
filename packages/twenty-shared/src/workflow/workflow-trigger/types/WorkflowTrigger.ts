export type GlobalAvailability = {
  type: 'GLOBAL';
  locations?: string[];
};

export type SingleRecordAvailability = {
  type: 'SINGLE_RECORD';
  objectNameSingular: string;
};

export type BulkRecordsAvailability = {
  type: 'BULK_RECORDS';
  objectNameSingular: string;
};
