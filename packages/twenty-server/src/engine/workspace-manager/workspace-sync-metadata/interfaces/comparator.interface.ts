import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

import { ComputedPartialFieldMetadata } from './partial-field-metadata.interface';
import { ComputedPartialWorkspaceEntity } from './partial-object-metadata.interface';

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
  | ComparatorCreateResult<
      Omit<ComputedPartialWorkspaceEntity, 'fields' | 'indexMetadatas'>
    >
  | ComparatorUpdateResult<
      Partial<
        Omit<ComputedPartialWorkspaceEntity, 'fields' | 'indexMetadatas'>
      > & {
        id: string;
      }
    >;

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

export type IndexComparatorResult =
  | ComparatorCreateResult<Partial<IndexMetadataEntity>>
  | ComparatorUpdateResult<Partial<IndexMetadataEntity>>
  | ComparatorDeleteResult<IndexMetadataEntity>;
