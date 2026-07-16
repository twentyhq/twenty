/**
 * Directus API client types used by the adapter.
 * Models the Directus REST API response shapes.
 */

/** Raw schema snapshot from Directus /server/info */
export interface DirectusSchemaInfo {
  version: string;
  directusVersion: string;
  projectName: string;
  projectUrl: string | null;
  projectColor: string | null;
  projectLogo: string | null;
  nodeVersion: string;
  nodeUptime: number;
  osType: string;
  osVersion: string;
  osUptime: number;
  osTotalmem: number;
}

/** A single collection from /collections */
export interface DirectusCollection {
  collection: string;
  meta: DirectusCollectionMeta;
  schema: DirectusCollectionSchema;
}

export interface DirectusCollectionMeta {
  collection: string;
  icon: string | null;
  note: string | null;
  displayTemplate: string | null;
  hidden: boolean;
  singleton: boolean;
  translations: unknown | null;
  archiveField: string | null;
  archiveAppFilter: boolean;
  archiveValue: string | null;
  unarchiveValue: string | null;
  sortField: string | null;
  accountability: string | null;
  color: string | null;
  itemDuplicationFields: unknown | null;
  sort: number | null;
  group: string | null;
  collapse: string;
  previewUrl: string | null;
  versioning: boolean;
}

export interface DirectusCollectionSchema {
  name: string;
  comment: string | null;
}

/** A single field from /fields */
export interface DirectusField {
  collection: string;
  field: string;
  type: string;
  meta: DirectusFieldMeta | null;
  schema: DirectusFieldSchema;
}

export interface DirectusFieldMeta {
  id: number;
  collection: string;
  field: string;
  special: string | null;
  interface: string | null;
  options: unknown | null;
  display: string | null;
  displayOptions: unknown | null;
  readonly: boolean;
  hidden: boolean;
  sort: number | null;
  width: string | null;
  translations: unknown | null;
  note: string | null;
  conditions: unknown | null;
  required: boolean;
  group: string | null;
  validation: unknown | null;
  validationMessage: string | null;
}

export interface DirectusFieldSchema {
  name: string;
  table: string;
  dataType: string;
  defaultValue: unknown | null;
  maxLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  isUnique: boolean;
  isNullable: boolean;
  isPrimaryKey: boolean;
  hasAutoIncrement: boolean;
  foreignKeyColumn: string | null;
  foreignKeyTable: string | null;
  comment: string | null;
  schema: string;
  foreignKeySchema: string | null;
}

/** Paginated items response */
export interface DirectusItemsResponse<T = Record<string, unknown>> {
  data: T[];
  meta?: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}

/** Single item response */
export interface DirectusItemResponse<T = Record<string, unknown>> {
  data: T;
}

/** Auth login response */
export interface DirectusAuthResponse {
  data: {
    accessToken: string;
    expires: number;
    refreshToken: string;
  };
}

/** Schema fingerprint for drift detection */
export interface DirectusSchemaFingerprint {
  collectionsHash: string;
  fieldsHash: string;
  collectionsCount: number;
  fieldsCount: number;
  capturedAt: string;
  directusVersion: string;
}
