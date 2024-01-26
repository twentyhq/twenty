import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';

import { PartialFieldMetadata } from './partial-field-metadata.interface';
import { PartialObjectMetadata } from './partial-object-metadata.interface';

export const enum ComparatorAction {
  SKIP = 'SKIP',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface ComparatorSkipResult {
  action: ComparatorAction.SKIP;
}

export interface ComparatorCreateResult<T> {
  action: ComparatorAction.CREATE;
  object: T;
}

export interface ComparatorUpdateResult<T> {
  action: ComparatorAction.UPDATE;
  object: T;
}

export interface ComparatorDeleteResult<T> {
  action: ComparatorAction.DELETE;
  object: T;
}

export type ObjectComparatorResult =
  | ComparatorSkipResult
  | ComparatorCreateResult<PartialObjectMetadata>
  | ComparatorUpdateResult<Partial<PartialObjectMetadata>>;

export type FieldComparatorResult =
  | ComparatorSkipResult
  | ComparatorCreateResult<PartialFieldMetadata>
  | ComparatorUpdateResult<Partial<PartialFieldMetadata> & { id: string }>
  | ComparatorDeleteResult<FieldMetadataEntity>;

export type RelationComparatorResult =
  | ComparatorCreateResult<Partial<RelationMetadataEntity>>
  | ComparatorDeleteResult<RelationMetadataEntity>;
