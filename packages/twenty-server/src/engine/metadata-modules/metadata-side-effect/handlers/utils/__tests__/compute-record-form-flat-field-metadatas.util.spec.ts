import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type RecordFormCandidateFlatFieldMetadata } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';

import { computeRecordFormFlatFieldMetadatas } from '../compute-record-form-flat-field-metadatas.util';

const buildFlatFieldMetadata = ({
  universalIdentifier,
  name,
  type = FieldMetadataType.TEXT,
  isSystem = false,
  isSystemSideEffect = false,
  isUIEditable = true,
  isActive = true,
  universalSettings = null,
}: {
  universalIdentifier: string;
  name: string;
  type?: FieldMetadataType;
  isSystem?: boolean;
  isSystemSideEffect?: boolean;
  isUIEditable?: boolean;
  isActive?: boolean;
  universalSettings?: Record<string, unknown> | null;
}): RecordFormCandidateFlatFieldMetadata =>
  ({
    universalIdentifier,
    name,
    type,
    isSystem,
    isSystemSideEffect,
    isUIEditable,
    isActive,
    universalSettings,
  }) as RecordFormCandidateFlatFieldMetadata;

const nameField = buildFlatFieldMetadata({
  universalIdentifier: 'field-name',
  name: 'name',
});
const cityField = buildFlatFieldMetadata({
  universalIdentifier: 'field-city',
  name: 'city',
});

describe('computeRecordFormFlatFieldMetadatas', () => {
  it('should place the label identifier first and keep the caller order after it', () => {
    const result = computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas: [cityField, nameField],
      labelIdentifierFieldMetadataUniversalIdentifier: 'field-name',
    });

    expect(result.map((field) => field.universalIdentifier)).toEqual([
      'field-name',
      'field-city',
    ]);
  });

  it.each([
    ['system', { isSystem: true }],
    ['engine owned', { isSystemSideEffect: true }],
    ['not UI editable', { isUIEditable: false }],
    ['inactive', { isActive: false }],
    ['of an unsupported type', { type: FieldMetadataType.POSITION }],
  ])('should drop a %s field', (_label, overrides) => {
    const result = computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas: [
        nameField,
        buildFlatFieldMetadata({
          universalIdentifier: 'field-dropped',
          name: 'dropped',
          ...overrides,
        }),
      ],
      labelIdentifierFieldMetadataUniversalIdentifier: 'field-name',
    });

    expect(result.map((field) => field.universalIdentifier)).toEqual([
      'field-name',
    ]);
  });

  it('should keep a many to one relation and drop the other relation types', () => {
    const result = computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas: [
        buildFlatFieldMetadata({
          universalIdentifier: 'field-company',
          name: 'company',
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.MANY_TO_ONE },
        }),
        buildFlatFieldMetadata({
          universalIdentifier: 'field-people',
          name: 'people',
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
        }),
      ],
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.map((field) => field.universalIdentifier)).toEqual([
      'field-company',
    ]);
  });
});
