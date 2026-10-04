import { type APPLICATION_VARIABLE_FIELD_METADATA_TYPES } from 'twenty-shared/application';
import { type Equal, type Expect } from 'twenty-shared/testing';
import { type FieldMetadataType, type ViewType } from 'twenty-shared/types';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type IsStringEnum } from 'src/engine/metadata-modules/flat-entity/types/is-string-enum.type';

// oxlint-disable-next-line unused-imports/no-unused-vars
type Assertions = [
  Expect<Equal<IsStringEnum<ViewType>, true>>,
  Expect<Equal<IsStringEnum<FieldMetadataType.TEXT>, true>>,
  Expect<
    Equal<
      IsStringEnum<(typeof APPLICATION_VARIABLE_FIELD_METADATA_TYPES)[number]>,
      true
    >
  >,
  Expect<Equal<IsStringEnum<`${ViewType}`>, false>>,
  Expect<Equal<IsStringEnum<'WORKSPACE' | 'USER'>, false>>,
  Expect<Equal<IsStringEnum<string>, false>>,
  Expect<Equal<IsStringEnum<EncryptedString>, false>>,
  Expect<Equal<IsStringEnum<`prefix_${string}`>, false>>,
  Expect<Equal<IsStringEnum<ViewType | null>, false>>,
  Expect<Equal<IsStringEnum<number>, false>>,
  Expect<Equal<IsStringEnum<never>, false>>,
];
