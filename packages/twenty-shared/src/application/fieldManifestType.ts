import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type FieldMetadataDefaultValue,
  type FieldMetadataOptions,
  type FieldMetadataType,
  type FieldMetadataUniversalSettings,
  type RelationAndMorphRelationFieldMetadataType,
} from '@/types';

export type RegularFieldManifest<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    RelationAndMorphRelationFieldMetadataType
  >,
> = SyncableEntityOptions & {
  type: T;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  /**
   * Default value in the canonical metadata format.
   *
   * Literal string defaults must be wrapped in single quotes inside the
   * string (e.g. `"'Draft'"`), including string sub-fields of composite
   * defaults (e.g. `{ source: "'MANUAL'" }`) and SELECT/MULTI_SELECT values.
   * Unquoted strings are reserved for computed defaults such as `'uuid'`
   * and `'now'`; any other unquoted string raises a validation warning.
   */
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  universalSettings?: FieldMetadataUniversalSettings<T>;
  isNullable?: boolean;
  /**
   * @deprecated Use defineIndex({ isUnique: true, fields: [...] }) instead.
   * Indexes are the SDK primitive for uniqueness — they support both single-
   * and multi-column unique constraints with a single, consistent API. This
   * field still works but will be removed in a future release.
   */
  isUnique?: boolean;
  objectUniversalIdentifier: string;
};

export type RelationFieldManifest<
  T extends RelationAndMorphRelationFieldMetadataType =
    RelationAndMorphRelationFieldMetadataType,
> = Omit<RegularFieldManifest<T>, 'universalSettings' | 'type'> & {
  type: T;
  relationTargetFieldMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
  universalSettings: FieldMetadataUniversalSettings<T>;
} & ([T] extends [FieldMetadataType.MORPH_RELATION]
    ? {
        morphId: string;
      }
    : {
        morphId?: undefined;
      });

export type FieldManifest<T extends FieldMetadataType = FieldMetadataType> =
  T extends RelationAndMorphRelationFieldMetadataType
    ? RelationFieldManifest<
        Extract<T, RelationAndMorphRelationFieldMetadataType>
      >
    : RegularFieldManifest<
        Exclude<T, RelationAndMorphRelationFieldMetadataType>
      >;
