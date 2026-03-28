import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

import { computeFlatViewFieldsToCreate } from '../compute-flat-view-fields-to-create.util';

const makeFieldMetadata = (
  overrides: Partial<UniversalFlatFieldMetadata> & {
    name: string;
    type: FieldMetadataType;
  },
): UniversalFlatFieldMetadata => {
  const universalIdentifier = overrides.universalIdentifier ?? v4();

  return {
    universalIdentifier,
    objectMetadataUniversalIdentifier: 'object-uid',
    applicationUniversalIdentifier: 'app-uid',
    name: overrides.name,
    label: overrides.label ?? overrides.name,
    type: overrides.type,
    isCustom: overrides.isCustom ?? false,
    isActive: true,
    isSystem: false,
    isUIReadOnly: false,
    isNullable: true,
    isUnique: false,
    isLabelSyncedWithName: false,
    defaultValue: null,
    description: null,
    icon: null,
    options: null,
    settings: null,
    standardOverrides: null,
    relationTargetObjectMetadataUniversalIdentifier: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  } as unknown as UniversalFlatFieldMetadata;
};

const flatApplication = {
  universalIdentifier: 'app-uid',
  id: 'app-id',
} as never;

const viewUniversalIdentifier = 'view-uid';

describe('computeFlatViewFieldsToCreate', () => {
  it('should exclude TS_VECTOR fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
      makeFieldMetadata({
        name: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
      }),
    ];

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      fields[0].universalIdentifier,
    );
  });

  it('should exclude POSITION fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
      makeFieldMetadata({
        name: 'position',
        type: FieldMetadataType.POSITION,
      }),
    ];

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      fields[0].universalIdentifier,
    );
  });

  it('should exclude RELATION and MORPH_RELATION fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
      makeFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
      }),
      makeFieldMetadata({
        name: 'target',
        type: FieldMetadataType.MORPH_RELATION,
      }),
    ];

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      fields[0].universalIdentifier,
    );
  });

  it('should exclude deletedAt field', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
      makeFieldMetadata({
        name: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
      }),
    ];

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      fields[0].universalIdentifier,
    );
  });

  it('should place label identifier field first', () => {
    const labelField = makeFieldMetadata({
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const otherField = makeFieldMetadata({
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
    });
    const fields = [otherField, labelField];

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier:
        labelField.universalIdentifier,
    });

    expect(result).toHaveLength(2);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      labelField.universalIdentifier,
    );
    expect(result[0].position).toBe(0);
    expect(result[1].fieldMetadataUniversalIdentifier).toBe(
      otherField.universalIdentifier,
    );
    expect(result[1].position).toBe(1);
  });

  it('should exclude label identifier when excludeLabelIdentifier is true', () => {
    const labelField = makeFieldMetadata({
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const otherField = makeFieldMetadata({
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
    });

    const result = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: [labelField, otherField],
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier:
        labelField.universalIdentifier,
      excludeLabelIdentifier: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldMetadataUniversalIdentifier).toBe(
      otherField.universalIdentifier,
    );
  });
});
