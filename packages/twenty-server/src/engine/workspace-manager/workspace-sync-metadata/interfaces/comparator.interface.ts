import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

import { ComputedPartialFieldMetadata } from './partial-field-metadata.interface';
import { ComputedPartialObjectMetadata } from './partial-object-metadata.interface';

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
  | ComparatorCreateResult<ComputedPartialObjectMetadata>
  | ComparatorUpdateResult<Partial<ComputedPartialObjectMetadata>>;

export type FieldComparatorResult =
  | ComparatorSkipResult
  | ComparatorCreateResult<ComputedPartialFieldMetadata>
  | ComparatorUpdateResult<
      Partial<ComputedPartialFieldMetadata> & { id: string }
    >
  | ComparatorDeleteResult<FieldMetadataEntity>;

export type RelationComparatorResult =
  | ComparatorCreateResult<Partial<RelationMetadataEntity>>
  | ComparatorDeleteResult<RelationMetadataEntity>
  | ComparatorUpdateResult<Partial<RelationMetadataEntity>>;
