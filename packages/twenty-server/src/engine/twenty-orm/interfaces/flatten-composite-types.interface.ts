import { CompositeMetadataTypes } from 'src/engine/metadata-modules/field-metadata/composite-types';

// TODO: At the time the composite types are generating union of types instead of a single type for their keys
// We need to find a way to fix that
export type FlattenCompositeTypes<T> = {
  [P in keyof T as T[P] extends CompositeMetadataTypes
    ? `${string & P}${Capitalize<string & keyof T[P]>}`
    : P]: T[P] extends CompositeMetadataTypes ? T[P][keyof T[P]] : T[P];
};
