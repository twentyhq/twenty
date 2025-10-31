import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

import { type ComputedPartialFieldMetadata } from './partial-field-metadata.interface';
import { type ComputedPartialWorkspaceEntity } from './partial-object-metadata.interface';

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

export type FieldRelationComparatorResult =
  | ComparatorSkipResult
  | ComparatorCreateResult<
      Partial<
        ComputedPartialFieldMetadata<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >
      > & {
        id: string;
        type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
      }
    >
  | ComparatorUpdateResult<
      Partial<
        ComputedPartialFieldMetadata<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >
      > & {
        id: string;
        type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
      }
    >
  | ComparatorDeleteResult<
      FieldMetadataEntity<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    >;

export type IndexComparatorResult =
  | ComparatorCreateResult<Partial<IndexMetadataEntity>>
  | ComparatorUpdateResult<Partial<IndexMetadataEntity>>
  | ComparatorDeleteResult<IndexMetadataEntity>;
