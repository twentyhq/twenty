import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { AI_SEARCH_ANSWER_MAX_FIELDS_PER_RECORD } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-fields-per-record.constant';
import { selectAiSearchAnswerEvidenceFields } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/select-ai-search-answer-evidence-fields.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const buildField = (
  overrides: Partial<FlatFieldMetadata> &
    Pick<FlatFieldMetadata, 'id' | 'name' | 'type'>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier: `uid-${overrides.id}`,
    objectMetadataId: 'company-object-id',
    ...overrides,
  });

const nameField = buildField({
  id: 'name',
  name: 'name',
  type: FieldMetadataType.TEXT,
});
const domainField = buildField({
  id: 'domain',
  name: 'domainName',
  type: FieldMetadataType.LINKS,
});
const salaryField = buildField({
  id: 'salary',
  name: 'salary',
  type: FieldMetadataType.CURRENCY,
});
const accountOwnerField = buildField({
  id: 'account-owner',
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.MANY_TO_ONE },
});
const peopleField = buildField({
  id: 'people',
  name: 'people',
  type: FieldMetadataType.RELATION,
  settings: { relationType: RelationType.ONE_TO_MANY },
});
const positionField = buildField({
  id: 'position',
  name: 'position',
  type: FieldMetadataType.POSITION,
});
const systemField = buildField({
  id: 'system',
  name: 'createdBy',
  type: FieldMetadataType.TEXT,
  isSystem: true,
});
const inactiveField = buildField({
  id: 'inactive',
  name: 'legacyNotes',
  type: FieldMetadataType.TEXT,
  isActive: false,
});

const selectFieldNames = ({
  flatFields,
  unreadableFieldMetadataIds = new Set<string>(),
  labelIdentifierFieldMetadataId = nameField.id,
}: {
  flatFields: FlatFieldMetadata[];
  unreadableFieldMetadataIds?: ReadonlySet<string>;
  labelIdentifierFieldMetadataId?: string | null;
}) =>
  selectAiSearchAnswerEvidenceFields({
    flatFields,
    labelIdentifierFieldMetadataId,
    unreadableFieldMetadataIds,
  }).map((field) => field.name);

describe('selectAiSearchAnswerEvidenceFields', () => {
  it('puts the label identifier first and keeps readable evidence fields', () => {
    expect(
      selectFieldNames({
        flatFields: [domainField, accountOwnerField, nameField],
      }),
    ).toEqual(['name', 'domainName', 'accountOwner']);
  });

  it('never selects a field the caller cannot read, the label identifier included', () => {
    expect(
      selectFieldNames({
        flatFields: [nameField, domainField, salaryField],
        unreadableFieldMetadataIds: new Set([salaryField.id, nameField.id]),
      }),
    ).toEqual(['domainName']);
  });

  it('leaves out system, inactive, positional and to-many relation fields', () => {
    expect(
      selectFieldNames({
        flatFields: [
          nameField,
          peopleField,
          positionField,
          systemField,
          inactiveField,
        ],
      }),
    ).toEqual(['name']);
  });

  it('caps the number of fields per record', () => {
    const manyFields = Array.from({ length: 30 }, (_, index) =>
      buildField({
        id: `text-${index}`,
        name: `text${index}`,
        type: FieldMetadataType.TEXT,
      }),
    );

    expect(
      selectFieldNames({ flatFields: [nameField, ...manyFields] }),
    ).toHaveLength(AI_SEARCH_ANSWER_MAX_FIELDS_PER_RECORD);
  });
});
