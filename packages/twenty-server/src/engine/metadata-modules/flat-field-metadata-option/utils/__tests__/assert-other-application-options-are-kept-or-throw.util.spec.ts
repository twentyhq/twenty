import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { assertOtherApplicationOptionsAreKeptOrThrow } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/assert-other-application-options-are-kept-or-throw.util';

const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const FIELD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const OPEN_OPTION_ID = '20202020-0000-4000-8000-000000000101';
const ARCHIVED_OPTION_ID = '20202020-0000-4000-8000-000000000201';

const openOption = {
  id: OPEN_OPTION_ID,
  value: 'OPEN',
  label: 'Open',
  color: 'green',
  position: 0,
} as const;
const archivedOption = {
  id: ARCHIVED_OPTION_ID,
  value: 'ARCHIVED',
  label: 'Archived',
  color: 'gray',
  position: 1,
} as const;

const buildOptionRow = ({
  option,
  applicationUniversalIdentifier,
}: {
  option: typeof openOption | typeof archivedOption;
  applicationUniversalIdentifier: string;
}): FlatFieldMetadataOption => ({
  id: option.id,
  workspaceId: '20202020-0000-4000-8000-0000000000ff',
  universalIdentifier: option.id,
  applicationId: applicationUniversalIdentifier,
  applicationUniversalIdentifier,
  fieldMetadataId: FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  value: option.value,
  label: option.label,
  color: option.color,
  position: option.position,
  isActive: true,
  overrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const existingFlatFieldMetadataOptionMaps = {
  byUniversalIdentifier: {
    [OPEN_OPTION_ID]: buildOptionRow({
      option: openOption,
      applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
    [ARCHIVED_OPTION_ID]: buildOptionRow({
      option: archivedOption,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
  },
};

const assertOptionsAreKept = ({
  options,
  callerApplicationUniversalIdentifier = WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  options: { id: string; value: string; label: string; position: number }[];
  callerApplicationUniversalIdentifier?: string;
}) =>
  assertOtherApplicationOptionsAreKeptOrThrow({
    flatFieldMetadatasToUpdate: [
      getFlatFieldMetadataMock({
        universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        objectMetadataId: '20202020-0000-4000-8000-000000000010',
        type: FieldMetadataType.SELECT,
        applicationUniversalIdentifier: FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
        options: options.map((option) => ({ ...option, color: 'green' })),
      }),
    ],
    existingFlatFieldMetadataOptionMaps,
    callerApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('assertOtherApplicationOptionsAreKeptOrThrow', () => {
  it('lets a workspace relabel the application option and remove its own', () => {
    expect(() =>
      assertOptionsAreKept({ options: [{ ...openOption, label: 'To do' }] }),
    ).not.toThrow();
  });

  it('rejects a workspace removing or re-valuing the application option', () => {
    expect(() => assertOptionsAreKept({ options: [archivedOption] })).toThrow(
      FieldMetadataException,
    );
    expect(() =>
      assertOptionsAreKept({
        options: [{ ...openOption, value: 'OPENED' }, archivedOption],
      }),
    ).toThrow(FieldMetadataException);
  });

  it('lets the application remove its own option', () => {
    expect(() =>
      assertOptionsAreKept({
        options: [archivedOption],
        callerApplicationUniversalIdentifier:
          FIELD_APPLICATION_UNIVERSAL_IDENTIFIER,
      }),
    ).not.toThrow();
  });
});
