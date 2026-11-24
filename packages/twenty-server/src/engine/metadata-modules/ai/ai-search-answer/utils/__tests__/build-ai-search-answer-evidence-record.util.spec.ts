import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildAiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/build-ai-search-answer-evidence-record.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const buildField = (
  overrides: Partial<FlatFieldMetadata> &
    Pick<FlatFieldMetadata, 'id' | 'name' | 'type' | 'label'>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: `uid-${overrides.id}`,
    objectMetadataId: 'company-object-id',
    ...overrides,
  });

const nameField = buildField({
  id: 'name',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.TEXT,
});
const employeesField = buildField({
  id: 'employees',
  name: 'employees',
  label: 'Employees',
  type: FieldMetadataType.NUMBER,
});
const cityField = buildField({
  id: 'city',
  name: 'city',
  label: 'City',
  type: FieldMetadataType.TEXT,
});
const accountOwnerField = buildField({
  id: 'account-owner',
  name: 'accountOwner',
  label: 'Account owner',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const buildEvidenceRecord = (record: Record<string, unknown>) =>
  buildAiSearchAnswerEvidenceRecord({
    record: { id: 'company-id', ...record },
    objectNameSingular: 'company',
    objectLabel: 'Company',
    displayName: 'Acme',
    evidenceFields: [nameField, employeesField, cityField, accountOwnerField],
    labelIdentifierFieldMetadataId: nameField.id,
    getRelationDisplayName: (_field, value) =>
      (value as { name?: string } | null)?.name ?? null,
  });

describe('buildAiSearchAnswerEvidenceRecord', () => {
  it('keeps only the selected fields the query returned', () => {
    const evidenceRecord = buildEvidenceRecord({
      name: 'Acme',
      employees: 120,
      accountOwner: { id: 'member-id', name: 'Jane Doe' },
      annualSalary: 'restricted value',
    });

    expect(evidenceRecord).toEqual({
      objectNameSingular: 'company',
      recordId: 'company-id',
      displayName: 'Acme',
      objectLabel: 'Company',
      fields: [
        { label: 'Employees', value: '120' },
        { label: 'Account owner', value: 'Jane Doe' },
      ],
    });
    expect(JSON.stringify(evidenceRecord)).not.toContain('restricted value');
  });

  it('skips empty values and the label identifier', () => {
    const evidenceRecord = buildEvidenceRecord({
      name: 'Acme',
      city: '   ',
      employees: null,
      accountOwner: null,
    });

    expect(evidenceRecord.fields).toEqual([]);
  });

  it('truncates long values', () => {
    const evidenceRecord = buildEvidenceRecord({ city: 'x'.repeat(1000) });

    expect(evidenceRecord.fields[0].value.length).toBeLessThan(1000);
    expect(evidenceRecord.fields[0].value.endsWith('…')).toBe(true);
  });
});
